"use server"

import { prisma } from "@/lib/prisma"
import {
  actionError,
  ActionResponse,
  actionSuccess,
} from "@/lib/action-response"
import { requireAdmin } from "@/lib/auth-server-hooks"
import { endOfDay, startOfDay } from "date-fns"
import { parseDateStr } from "@/lib/format"
import {
  canReschedule,
  canUpdateAppointmentStatus,
} from "@/lib/appointment-status"
import { AdminAppointment, AdminAppointmentsFilter } from "@/types/appointment"
import { AppointmentStatus } from "@/generated/prisma/index"
import {
  adminBookingsFilterSchema,
  rescheduleAppointmentSchema,
  RescheduleAppointmentInput,
} from "@/lib/validations/admin-appointment"
import { validateSlot } from "../slot-validator"

export async function getAdminAppointments(
  filter: AdminAppointmentsFilter = {}
): Promise<ActionResponse<AdminAppointment[]>> {
  try {
    await requireAdmin()
    // const data = adminBookingsFilterSchema.parse(filter)
    const data = filter

    const appointments = await prisma.appointment.findMany({
      where: {
        ...(data.status && { status: data.status }),
        ...(data.date && {
          startsAt: {
            gte: startOfDay(parseDateStr(data.date)),
            lt: endOfDay(parseDateStr(data.date)),
          },
        }),
        ...(data.serviceId && { serviceId: data.serviceId }),
        ...(data.query && {
          client: {
            OR: [
              { name: { contains: data.query, mode: "insensitive" } },
              { email: { contains: data.query, mode: "insensitive" } },
            ],
          },
        }),
      },
      include: {
        client: { select: { id: true, name: true, email: true, phone: true } },
        service: { include: { category: true } },
      },
      orderBy: { startsAt: "desc" },
    })

    return actionSuccess(appointments, "Get appointments success")
  } catch (error) {
    return actionError(error, "Get appointments error")
  }
}

export async function getAdminAppointmentCounts(): Promise<
  ActionResponse<Record<AppointmentStatus, number>>
> {
  try {
    await requireAdmin()
    const grouped = await prisma.appointment.groupBy({
      by: ["status"],
      _count: { _all: true },
    })

    const counts: Record<AppointmentStatus, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      NO_SHOW: 0,
    }
    for (const row of grouped) {
      counts[row.status] = row._count._all
    }

    return actionSuccess(counts, "Get appointment counts success")
  } catch (error) {
    return actionError(error, "Get appointment counts error")
  }
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
): Promise<ActionResponse<null>> {
  try {
    await requireAdmin()
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId },
    })
    if (!appointment) return actionError(null, "Appointment not found")

    if (!canUpdateAppointmentStatus(appointment.status, status)) {
      return actionError(
        null,
        `Appointment cannot be moved from ${appointment.status} to ${status}`
      )
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    })

    return actionSuccess(null, "Appointment status updated")
  } catch (error) {
    return actionError(error, "Failed to update appointment status")
  }
}

export async function rescheduleAppointment(
  appointmentId: string,
  input: RescheduleAppointmentInput
): Promise<ActionResponse<null>> {
  try {
    await requireAdmin()
    const data = rescheduleAppointmentSchema.parse(input)

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true },
    })
    if (!appointment) return actionError(null, "Appointment not found")
    if (!canReschedule(appointment.status)) {
      return actionError(null, "This appointment cannot be rescheduled")
    }

    const date = parseDateStr(data.date)

    const validation = await validateSlot(
      date,
      data.timeSlot,
      appointment.service.durationMinutes,
      appointmentId
    )
    if (!validation.success) {
      return actionError(null, validation.error)
    }

    const { startsAt, endsAt } = validation

    await prisma.$transaction(async (tx) => {
      const conflict = await tx.appointment.findFirst({
        where: {
          id: { not: appointmentId },
          status: { not: "CANCELLED" },
          startsAt: { lt: endsAt },
          endsAt: { gt: startsAt },
        },
      })
      if (conflict) {
        throw new Error("SLOT_TAKEN")
      }

      await tx.appointment.update({
        where: { id: appointmentId },
        data: { startsAt, endsAt },
      })
    })

    return actionSuccess(null, "Appointment rescheduled")
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_TAKEN") {
      return actionError(error, "This time slot is already booked")
    }
    return actionError(error, "Failed to reschedule appointment")
  }
}
