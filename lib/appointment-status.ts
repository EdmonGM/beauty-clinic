import { AppointmentStatus } from "@/generated/prisma/index"

export type AppointmentStatusBadgeVariant =
  "default" | "secondary" | "destructive" | "outline"

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
]

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
}

export const STATUS_BADGE_VARIANT: Record<
  AppointmentStatus,
  AppointmentStatusBadgeVariant
> = {
  PENDING: "outline",
  CONFIRMED: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
  NO_SHOW: "destructive",
}

const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "NO_SHOW", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
}

export function canUpdateAppointmentStatus(
  from: AppointmentStatus,
  to: AppointmentStatus
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to)
}

export function canReschedule(status: AppointmentStatus): boolean {
  return status === "PENDING" || status === "CONFIRMED"
}
