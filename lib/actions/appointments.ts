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
import { DayOfWeek } from "@/generated/prisma/index"

const SLOT_INTERVAL_MINUTES = 30

const DAY_OF_WEEK_MAP: Record<string, DayOfWeek> = {
  Sunday: DayOfWeek.SUNDAY,
  Monday: DayOfWeek.MONDAY,
  Tuesday: DayOfWeek.TUESDAY,
  Wednesday: DayOfWeek.WEDNESDAY,
  Thursday: DayOfWeek.THURSDAY,
  Friday: DayOfWeek.FRIDAY,
  Saturday: DayOfWeek.SATURDAY,
}

function parseDateStr(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function formatTimeStr(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0")
  const m = String(date.getMinutes()).padStart(2, "0")
  return `${h}:${m}`
}

function toISO(date: Date): string {
  return date.toISOString()
}

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
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" })
    const dayOfWeek = DAY_OF_WEEK_MAP[dayName]
    if (!dayOfWeek) return actionSuccess([], "Clinic is closed on Sundays")

    const availability = await prisma.availability.findMany({
      where: { dayOfWeek },
    })
    if (availability.length === 0) {
      return actionSuccess([], "Clinic is closed on this day")
    }

    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const [blockedSlots, existingAppointments] = await Promise.all([
      prisma.blockedSlot.findMany({
        where: {
          startsAt: { lt: dayEnd },
          endsAt: { gt: dayStart },
        },
      }),
      prisma.appointment.findMany({
        where: {
          serviceId,
          status: { not: "CANCELLED" },
          startsAt: { lt: dayEnd },
          endsAt: { gt: dayStart },
        },
      }),
    ])

    const now = new Date()
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()

    const available: AvailableSlot[] = []

    for (const slot of availability) {
      const [openH, openM] = slot.startTime.split(":").map(Number)
      const [closeH, closeM] = slot.endTime.split(":").map(Number)

      const windowStart = new Date(date)
      windowStart.setHours(openH, openM, 0, 0)
      const windowEnd = new Date(date)
      windowEnd.setHours(closeH, closeM, 0, 0)

      let cursor = new Date(windowStart)

      while (true) {
        const slotEnd = new Date(
          cursor.getTime() + service.durationMinutes * 60 * 1000
        )

        if (slotEnd > windowEnd) break

        if (isToday && cursor <= now) {
          cursor = new Date(
            cursor.getTime() + SLOT_INTERVAL_MINUTES * 60 * 1000
          )
          continue
        }

        const overlapsBlocked = blockedSlots.some(
          (b) => b.startsAt < slotEnd && b.endsAt > cursor
        )
        const overlapsAppointment = existingAppointments.some(
          (a) => a.startsAt < slotEnd && a.endsAt > cursor
        )

        if (!overlapsBlocked && !overlapsAppointment) {
          available.push({
            startsAt: toISO(cursor),
            endsAt: toISO(slotEnd),
          })
        }

        cursor = new Date(cursor.getTime() + SLOT_INTERVAL_MINUTES * 60 * 1000)
      }
    }

    return actionSuccess(available, "Available slots retrieved")
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
    const [timeH, timeM] = data.timeSlot.split(":").map(Number)

    const startsAt = new Date(date)
    startsAt.setHours(timeH, timeM, 0, 0)
    const endsAt = new Date(
      startsAt.getTime() + service.durationMinutes * 60 * 1000
    )

    if (startsAt <= new Date()) {
      return actionError(null, "Cannot book a slot in the past")
    }

    const dayName = date.toLocaleDateString("en-US", { weekday: "long" })
    const dayOfWeek = DAY_OF_WEEK_MAP[dayName]

    const availability = await prisma.availability.findMany({
      where: { dayOfWeek },
    })
    const withinHours = availability.some(
      (a) => a.startTime <= data.timeSlot && a.endTime >= formatTimeStr(endsAt)
    )
    if (!withinHours) {
      return actionError(null, "Selected time is outside clinic hours")
    }

    const [blockedOverlap, appointmentOverlap] = await Promise.all([
      prisma.blockedSlot.findFirst({
        where: { startsAt: { lt: endsAt }, endsAt: { gt: startsAt } },
      }),
      prisma.appointment.findFirst({
        where: {
          status: { not: "CANCELLED" },
          startsAt: { lt: endsAt },
          endsAt: { gt: startsAt },
        },
      }),
    ])

    if (blockedOverlap) {
      return actionError(null, "This time slot is not available")
    }
    if (appointmentOverlap) {
      return actionError(null, "This time slot is already booked")
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientId: session.user.id,
        serviceId: data.serviceId,
        startsAt,
        endsAt,
        notes: data.notes || null,
      },
    })

    return actionSuccess(appointment.id, "Appointment booked successfully")
  } catch (error) {
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
