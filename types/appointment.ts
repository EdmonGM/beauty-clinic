import { Appointment, AppointmentStatus, Service, Category, User } from "@/generated/prisma"

export type AvailableSlot = {
  startsAt: string
  endsAt: string
}

export type AppointmentWithService = Appointment & {
  service: Service & { category: Category }
}

export type AdminAppointment = Appointment & {
  client: Pick<User, "id" | "name" | "email" | "phone">
  service: Service & { category: Category }
}

export type AdminAppointmentsFilter = {
  status?: AppointmentStatus
  date?: string
  serviceId?: string
  query?: string
}
