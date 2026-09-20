import z from "zod"

export const createBlockedSlotSchema = z
  .object({
    startsAt: z.iso.datetime("Invalid datetime format"),
    endsAt: z.iso.datetime("Invalid datetime format"),
    reason: z
      .string()
      .max(255, "Reason must be at most 255 characters")
      .optional(),
  })
  .refine((data) => new Date(data.startsAt) < new Date(data.endsAt), {
    message: "Start time must be before end time",
    path: ["endsAt"],
  })

export type CreateBlockedSlotInput = z.infer<typeof createBlockedSlotSchema>
export type UpdateBlockedSlotInput = z.infer<typeof createBlockedSlotSchema>
