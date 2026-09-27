"use server"

import { prisma } from "@/lib/prisma"
import { ActionResponse } from "@/types/action-response"
import { requireClient } from "@/lib/auth-server-hooks"
import { BookAppointmentInput } from "@/lib/validations/appointment"
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
    if (!service)
      return { success: false, error: null, message: "Service not found" }

    const date = parseDateStr(dateStr)
    const slots = await generateAvailableSlots(date, service.durationMinutes)

    if (slots.length === 0) {
      return {
        success: true,
        data: [],
        message: "No available slots on this day",
      }
    }

    return { success: true, data: slots, message: "Available slots retrieved" }
  } catch (error) {
    return { success: false, error, message: "Failed to get available slots" }
  }
}

export async function createAppointment(
  input: BookAppointmentInput
): Promise<ActionResponse<string>> {
  try {
    const session = await requireClient()

    const service = await prisma.service.findFirst({
      where: { id: input.serviceId, isActive: true },
    })
    if (!service)
      return { success: false, error: null, message: "Service not found" }

    const date = parseDateStr(input.date)

    const validation = await validateSlot(
      date,
      input.timeSlot,
      service.durationMinutes
    )
    if (!validation.success) {
      return { success: false, error: null, message: validation.error }
    }

    const { startsAt, endsAt } = validation

    const appointment = await prisma.appointment.create({
      data: {
        clientId: session.user.id,
        serviceId: input.serviceId,
        startsAt,
        endsAt,
        notes: input.notes || null,
      },
    })

    return {
      success: true,
      data: appointment.id,
      message: "Appointment booked successfully",
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return {
        success: false,
        error,
        message: "You need to be logged in to book an appointment",
      }
    }
    return { success: false, error, message: "Failed to create appointment" }
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
    return {
      success: true,
      data: appointments,
      message: "Appointments retrieved",
    }
  } catch (error) {
    return { success: false, error, message: "Failed to get appointments" }
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
    if (!appointment)
      return { success: false, error: null, message: "Appointment not found" }
    if (
      appointment.status !== "PENDING" &&
      appointment.status !== "CONFIRMED"
    ) {
      return {
        success: false,
        error: null,
        message: "This appointment cannot be cancelled",
      }
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "CANCELLED" },
    })

    return { success: true, data: null, message: "Appointment cancelled" }
  } catch (error) {
    return { success: false, error, message: "Failed to cancel appointment" }
  }
}
