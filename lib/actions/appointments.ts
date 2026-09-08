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
import { DayOfWeek, Availability } from "@/generated/prisma/index"
import {
  addMinutes,
  areIntervalsOverlapping,
  format,
  isBefore,
  startOfDay,
  endOfDay,
} from "date-fns"
import { formatTimeStr, parseDateStr, setTimeStr } from "@/lib/format"

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

/**
 * Returns the clinic's availability windows for the given date's weekday.
 * Empty array means closed that day.
 */
export async function getDayAvailability(date: Date): Promise<Availability[]> {
  const dayName = format(date, "EEEE")
  const dayOfWeek = DAY_OF_WEEK_MAP[dayName]
  if (!dayOfWeek) return []
  return prisma.availability.findMany({ where: { dayOfWeek } })
}

/** Whether a [start, end) interval falls fully within any availability window. */
function isWithinAvailability(
  availability: Availability[],
  start: Date,
  end: Date
): boolean {
  const startStr = formatTimeStr(start)
  const endStr = formatTimeStr(end)
  return availability.some(
    (a) => a.startTime <= startStr && a.endTime >= endStr
  )
}

type Interval = { startsAt: Date; endsAt: Date }

function overlaps(a: Interval, start: Date, end: Date): boolean {
  return areIntervalsOverlapping(
    { start: a.startsAt, end: a.endsAt },
    { start, end }
  )
}

/**
 * Fetches blocked slots and (non-cancelled) appointments overlapping the
 * given day, optionally filtered to a single service. Use with
 * `hasConflict` to check individual candidate slots without re-querying.
 */
export async function getDayConflicts(date: Date, serviceId?: string) {
  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)

  const [blockedSlots, appointments] = await Promise.all([
    prisma.blockedSlot.findMany({
      where: { startsAt: { lt: dayEnd }, endsAt: { gt: dayStart } },
    }),
    prisma.appointment.findMany({
      where: {
        ...(serviceId && { serviceId }),
        status: { not: "CANCELLED" },
        startsAt: { lt: dayEnd },
        endsAt: { gt: dayStart },
      },
    }),
  ])

  return { blockedSlots, appointments }
}

/** Whether a candidate [start, end) slot overlaps any blocked slot or appointment. */
function hasConflict(
  conflicts: { blockedSlots: Interval[]; appointments: Interval[] },
  start: Date,
  end: Date
): boolean {
  return (
    conflicts.blockedSlots.some((b) => overlaps(b, start, end)) ||
    conflicts.appointments.some((a) => overlaps(a, start, end))
  )
}

/**
 * Generates all bookable slots for a service on a given date, applying
 * clinic hours, "no past slots today", and conflict checks. This is the
 * single source of truth for slot validity — `createAppointment` checks
 * a candidate slot against this same list rather than re-deriving rules.
 */
export async function generateAvailableSlots(
  date: Date,
  durationMinutes: number,
  serviceId: string
): Promise<AvailableSlot[]> {
  const availability = await getDayAvailability(date)
  if (availability.length === 0) return []

  const conflicts = await getDayConflicts(date, serviceId)
  const now = new Date()
  const slots: AvailableSlot[] = []

  for (const window of availability) {
    const windowStart = setTimeStr(date, window.startTime)
    const windowEnd = setTimeStr(date, window.endTime)

    let cursor = windowStart
    while (true) {
      const slotEnd = addMinutes(cursor, durationMinutes)
      if (isBefore(windowEnd, slotEnd)) break

      const isPast = isBefore(cursor, now) || cursor.getTime() === now.getTime()
      if (!isPast && !hasConflict(conflicts, cursor, slotEnd)) {
        slots.push({
          startsAt: cursor.toISOString(),
          endsAt: slotEnd.toISOString(),
        })
      }

      cursor = addMinutes(cursor, SLOT_INTERVAL_MINUTES)
    }
  }

  return slots
}

/** Whether a candidate [start, end) slot is one of the generated available slots. */
function isGeneratedSlot(
  slots: AvailableSlot[],
  start: Date,
  end: Date
): boolean {
  const startISO = start.toISOString()
  const endISO = end.toISOString()
  return slots.some((s) => s.startsAt === startISO && s.endsAt === endISO)
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
    const slots = await generateAvailableSlots(
      date,
      service.durationMinutes,
      serviceId
    )

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

    // Re-derive the exact same candidate slots getAvailableSlots would show,
    // so "is this slot valid" can never drift out of sync between the two
    // functions. This also enforces slot-grid alignment for free.
    const slots = await generateAvailableSlots(
      date,
      service.durationMinutes,
      data.serviceId
    )

    const [timeH, timeM] = data.timeSlot.split(":").map(Number)
    const startsAt = new Date(date)
    startsAt.setHours(timeH, timeM, 0, 0)
    const endsAt = new Date(
      startsAt.getTime() + service.durationMinutes * 60 * 1000
    )

    if (!isGeneratedSlot(slots, startsAt, endsAt)) {
      return actionError(null, "Selected time is not available")
    }

    // Re-check for conflicts inside a transaction immediately before create,
    // to shrink (though not eliminate) the race window between the check
    // above and the insert below. For strict guarantees, add a DB-level
    // exclusion constraint on appointment time ranges.
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
