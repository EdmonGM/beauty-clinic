import { AvailableSlot } from "@/types/appointment"
import z from "zod"

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
})

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>

export const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  durationMinutes: z.number().int().positive("Duration must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  isActive: z.boolean(),
})

export type ServiceInput = z.infer<typeof serviceSchema>

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
})

export type CategoryInput = z.infer<typeof categorySchema>

export const bookingSchema = z.object({
  date: z.date("Select a date"),
  slot: z.custom<AvailableSlot>((v) => !!v, "Select a time"),
  notes: z.string().optional(),
})

export type BookingInput = z.infer<typeof bookingSchema>
