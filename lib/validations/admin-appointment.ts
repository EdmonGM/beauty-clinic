import z from "zod"

export const adminAppointmentsFilterSchema = z.object({
  status: z
    .enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"])
    .optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .optional(),
  serviceId: z.string().optional(),
  query: z.string().max(100).optional(),
})

export type AdminAppointmentsFilterInput = z.infer<
  typeof adminAppointmentsFilterSchema
>

export const rescheduleAppointmentSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
})

export type RescheduleAppointmentInput = z.infer<
  typeof rescheduleAppointmentSchema
>
