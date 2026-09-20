"use server"

import { prisma } from "@/lib/prisma"
import {
  actionError,
  ActionResponse,
  actionSuccess,
} from "@/lib/action-response"
import { requireClient } from "@/lib/auth-server-hooks"
import {
  bookAppointmentSchema,
  BookAppointmentInput,
} from "@/lib/validations/appointment"
import { AvailableSlot, AppointmentWithService } from "@/types/appointment"
import { parseDateStr } from "@/lib/format"
import { validateSlot } from "../slot-validator"
import { generateAvailableSlots } from "../slot-generator"

export async function getAvailableSlots(
  serviceId: string,
  dateStr: string
): Promise<ActionResponse<AvailableSlot[]>> {
  try {
    const service = await prisma.service.findFirst({
      where: { id: serviceId, isActive: true },
    })
    if (!service) return actionError(null, "Service not found")

    const date = parseDateStr(dateStr)
    const slots = await generateAvailableSlots(date, service.durationMinutes)

    if (slots.length === 0) {
      return actionSuccess([], "No available slots on this day")
    }

    return actionSuccess(slots, "Available slots retrieved")
  } catch (error) {
    return actionError(error, "Failed to get available slots")
  }
}

export async function createAppointment(
  input: BookAppointmentInput
): Promise<ActionResponse<string>> {
  try {
    const session = await requireClient()
    const data = bookAppointmentSchema.parse(input)

    const service = await prisma.service.findFirst({
      where: { id: data.serviceId, isActive: true },
    })
    if (!service) return actionError(null, "Service not found")

    const date = parseDateStr(data.date)

    const validation = await validateSlot(
      date,
      data.timeSlot,
      service.durationMinutes
    )
    if (!validation.success) {
      return actionError(null, validation.error)
    }

    const { startsAt, endsAt } = validation

    // Re-check for conflicts inside a transaction immediately before create.
    const appointment = await prisma.$transaction(async (tx) => {
      const conflict = await tx.appointment.findFirst({
        where: {
          status: { not: "CANCELLED" },
          startsAt: { lt: endsAt },
          endsAt: { gt: startsAt },
        },
      })
      if (conflict) {
        throw new Error("SLOT_TAKEN")
      }

      return tx.appointment.create({
        data: {
          clientId: session.user.id,
          serviceId: data.serviceId,
          startsAt,
          endsAt,
          notes: data.notes || null,
        },
      })
    })

    return actionSuccess(appointment.id, "Appointment booked successfully")
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_TAKEN") {
      return actionError(error, "This time slot is already booked")
    }
    return actionError(error, "Failed to create appointment")
  }
}

export async function getClientAppointments(): Promise<
  ActionResponse<AppointmentWithService[]>
> {
  try {
    const session = await requireClient()
    const appointments = await prisma.appointment.findMany({
      where: { clientId: session.user.id },
      include: { service: { include: { category: true } } },
      orderBy: { startsAt: "desc" },
    })
    return actionSuccess(appointments, "Appointments retrieved")
  } catch (error) {
    return actionError(error, "Failed to get appointments")
  }
}

export async function cancelAppointment(
  appointmentId: string
): Promise<ActionResponse<null>> {
  try {
    const session = await requireClient()
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, clientId: session.user.id },
    })
    if (!appointment) return actionError(null, "Appointment not found")
    if (
      appointment.status !== "PENDING" &&
      appointment.status !== "CONFIRMED"
    ) {
      return actionError(null, "This appointment cannot be cancelled")
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "CANCELLED" },
    })

    return actionSuccess(null, "Appointment cancelled")
  } catch (error) {
    return actionError(error, "Failed to cancel appointment")
  }
}
