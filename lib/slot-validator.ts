import { addMinutes } from "date-fns"
import { setTimeStr } from "@/lib/format"
import { generateAvailableSlots, isGeneratedSlot } from "./slot-generator"

export type SlotValidationResult =
  | { success: true; startsAt: Date; endsAt: Date }
  | { success: false; error: string }

/**
 * Validates and parses a time slot string against available slots for a given date and duration.
 *
 * This is the single source of truth for slot validation — both `createAppointment` and
 * `rescheduleAppointment` use this to ensure consistent behavior across the app.
 *
 * @param date — The date to validate the slot for
 * @param timeSlot — Time string in "HH:mm" format
 * @param durationMinutes — Service duration in minutes
 * @param excludeAppointmentId — (Optional) When rescheduling, exclude this appointment from conflict checks
 * @returns Validation result with parsed start/end times or error
 */
export async function validateSlot(
  date: Date,
  timeSlot: string,
  durationMinutes: number,
  excludeAppointmentId?: string
): Promise<SlotValidationResult> {
  try {
    // Generate the full list of valid slots for this date/duration
    const slots = await generateAvailableSlots(
      date,
      durationMinutes,
      excludeAppointmentId
    )

    const startsAt = setTimeStr(date, timeSlot)
    const endsAt = addMinutes(startsAt, durationMinutes)

    if (!isGeneratedSlot(slots, startsAt, endsAt)) {
      return {
        success: false,
        error: "Selected time is not available",
      }
    }

    return {
      success: true,
      startsAt,
      endsAt,
    }
  } catch (error) {
    return {
      success: false,
      error: "Failed to validate time slot",
    }
  }
}
