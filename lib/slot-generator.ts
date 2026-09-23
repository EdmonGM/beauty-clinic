import { Availability, DayOfWeek } from "@/generated/prisma"
import { prisma } from "./prisma"
import {
  addMinutes,
  areIntervalsOverlapping,
  endOfDay,
  format,
  isBefore,
  startOfDay,
} from "date-fns"
import { AvailableSlot } from "@/types/appointment"

const DAY_OF_WEEK_MAP: Record<string, DayOfWeek> = {
  Sunday: DayOfWeek.SUNDAY,
  Monday: DayOfWeek.MONDAY,
  Tuesday: DayOfWeek.TUESDAY,
  Wednesday: DayOfWeek.WEDNESDAY,
  Thursday: DayOfWeek.THURSDAY,
  Friday: DayOfWeek.FRIDAY,
  Saturday: DayOfWeek.SATURDAY,
}

const SLOT_INTERVAL_MINUTES = 30

type Interval = { startsAt: Date; endsAt: Date }

function overlaps(a: Interval, start: Date, end: Date): boolean {
  return areIntervalsOverlapping(
    { start: a.startsAt, end: a.endsAt },
    { start, end }
  )
}

/** Whether a candidate [start, end) slot overlaps any appointment. */
function hasConflict(
  conflicts: { appointments: Interval[] },
  start: Date,
  end: Date
): boolean {
  return conflicts.appointments.some((a) => overlaps(a, start, end))
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

/**
 * Fetches (non-cancelled) appointments overlapping the
 * given day, optionally excluding a single appointment. Excluded slots are
 * treated as global conflicts — the clinic is modelled as one room, so any
 * appointment blocks any slot regardless of service. Use with `hasConflict`
 * to check individual candidate slots without re-querying.
 */
export async function getDayConflicts(
  date: Date,
  excludeAppointmentId?: string
) {
  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)

  const appointments = await prisma.appointment.findMany({
    where: {
      ...(excludeAppointmentId && { id: { not: excludeAppointmentId } }),
      status: { not: "CANCELLED" },
      startsAt: { lt: dayEnd },
      endsAt: { gt: dayStart },
    },
  })

  return { appointments }
}

/**
 * Generates all bookable slots for a service on a given date, applying
 * clinic hours, "no past slots today", and conflict checks. This is the
 * single source of truth for slot validity — `createAppointment` checks
 * a candidate slot against this same list rather than re-deriving rules.
 *
 * `excludeAppointmentId` lets rescheduling omit the appointment being
 * moved so it does not conflict with its own current slot.
 */
export async function generateAvailableSlots(
  date: Date,
  durationMinutes: number,
  excludeAppointmentId?: string
): Promise<AvailableSlot[]> {
  const availability = await getDayAvailability(date)
  if (availability.length === 0) return []

  const conflicts = await getDayConflicts(date, excludeAppointmentId)
  const now = new Date()
  const slots: AvailableSlot[] = []

  for (const window of availability) {
    const windowStart = new Date(date)
    windowStart.setHours(
      parseInt(window.startTime.split(":")[0]),
      parseInt(window.startTime.split(":")[1]),
      0,
      0
    )
    const windowEnd = new Date(date)
    windowEnd.setHours(
      parseInt(window.endTime.split(":")[0]),
      parseInt(window.endTime.split(":")[1]),
      0,
      0
    )

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
export async function isGeneratedSlot(
  slots: AvailableSlot[],
  start: Date,
  end: Date
): Promise<boolean> {
  const startISO = start.toISOString()
  const endISO = end.toISOString()
  return slots.some((s) => s.startsAt === startISO && s.endsAt === endISO)
}
