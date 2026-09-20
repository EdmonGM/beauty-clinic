import z from "zod"

export const createAvailabilitySchema = z
  .object({
    dayOfWeek: z.enum(
      [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ],
      "Invalid day of week"
    ),
    startTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Start time must be in HH:mm format"),
    endTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "End time must be in HH:mm format"),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "Start time must be before end time",
    path: ["endTime"],
  })

export type CreateAvailabilityInput = z.infer<typeof createAvailabilitySchema>
export type UpdateAvailabilityInput = z.infer<typeof createAvailabilitySchema>
