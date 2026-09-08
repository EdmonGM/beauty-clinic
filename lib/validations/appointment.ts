import z from "zod"

export const bookAppointmentSchema = z.object({
  serviceId: z.string().min(1, "Service is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  notes: z.string().optional(),
})

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>
