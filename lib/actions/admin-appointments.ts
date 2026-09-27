"use server"

import { prisma } from "@/lib/prisma"
import { ActionResponse } from "@/types/action-response"
import { requireAdmin } from "@/lib/auth-server-hooks"
import { endOfDay, startOfDay } from "date-fns"
import { parseDateStr } from "@/lib/format"
import { canReschedule } from "@/lib/appointment-status"
import {
  AdminAppointment,
  AdminAppointmentsFilterInput,
  AvailableSlot,
} from "@/types/appointment"
import { AppointmentStatus } from "@/generated/prisma/index"
import {
  rescheduleAppointmentSchema,
  RescheduleAppointmentInput,
} from "@/lib/validations/admin-appointment"
import { validateSlot } from "../slot-validator"
import { generateAvailableSlots } from "../slot-generator"

export async function getAdminAvailableSlots(
  date: Date,
  durationMinutes: number,
  excludeAppointmentId?: string
): Promise<ActionResponse<AvailableSlot[]>> {
  try {
    requireAdmin()
    return {
      success: true,
      data: await generateAvailableSlots(
        date,
        durationMinutes,
        excludeAppointmentId
      ),
      message: "Get available slots success",
    }
  } catch (error) {
    return { success: false, error, message: "Get available slots error" }
  }
}

export async function getAdminAppointments(
  filter: AdminAppointmentsFilterInput = {}
): Promise<ActionResponse<AdminAppointment[]>> {
  try {
    await requireAdmin()

    const appointments = await prisma.appointment.findMany({
      where: {
        status: filter.status,
        startsAt: filter.date
          ? {
              gte: startOfDay(parseDateStr(filter.date)),
              lt: endOfDay(parseDateStr(filter.date)),
            }
          : undefined,
        serviceId: filter.serviceId,
        client: filter.query
          ? {
              OR: [
                { name: { contains: filter.query, mode: "insensitive" } },
                { email: { contains: filter.query, mode: "insensitive" } },
              ],
            }
          : undefined,
      },
      include: {
        client: { select: { id: true, name: true, email: true, phone: true } },
        service: { include: { category: true } },
      },
      orderBy: { startsAt: "desc" },
    })

    return {
      success: true,
      data: appointments,
      message: "Get appointments success",
    }
  } catch (error) {
    return { success: false, error, message: "Get appointments error" }
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

    return {
      success: true,
      data: counts,
      message: "Get appointment counts success",
    }
  } catch (error) {
    return { success: false, error, message: "Get appointment counts error" }
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
    if (!appointment)
      return { success: false, error: null, message: "Appointment not found" }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    })

    return { success: true, data: null, message: "Appointment status updated" }
  } catch (error) {
    return {
      success: false,
      error,
      message: "Failed to update appointment status",
    }
  }
}

export async function rescheduleAppointment(
  appointmentId: string,
  input: RescheduleAppointmentInput
): Promise<ActionResponse<null>> {
  try {
    await requireAdmin()

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true },
    })
    if (!appointment)
      return { success: false, error: null, message: "Appointment not found" }
    if (!canReschedule(appointment.status)) {
      return {
        success: false,
        error: null,
        message: "This appointment cannot be rescheduled",
      }
    }

    const date = parseDateStr(input.date)

    const validation = await validateSlot(
      date,
      input.timeSlot,
      appointment.service.durationMinutes,
      appointmentId
    )
    if (!validation.success) {
      return { success: false, error: null, message: validation.error }
    }

    const { startsAt, endsAt } = validation

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { startsAt, endsAt },
    })

    return { success: true, data: null, message: "Appointment rescheduled" }
  } catch (error) {
    return {
      success: false,
      error,
      message: "Failed to reschedule appointment",
    }
  }
}
