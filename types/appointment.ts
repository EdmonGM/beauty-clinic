import { Appointment, Service, Category } from "@/generated/prisma"

export type AvailableSlot = {
  startsAt: string
  endsAt: string
}

export type AppointmentWithService = Appointment & {
  service: Service & { category: Category }
}
