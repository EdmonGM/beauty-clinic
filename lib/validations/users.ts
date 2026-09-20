import z from "zod"

export const clientIdSchema = z.string().trim().min(1).max(128)

export const clientNotesSchema = z.object({
  notes: z.string().trim().max(2000, "Notes must be at most 2000 characters"),
})

export type ClientNotesInput = z.infer<typeof clientNotesSchema>
