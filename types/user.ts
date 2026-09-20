import type { AppointmentStatus } from "@/generated/prisma/index"

export type AdminClientListItem = {
  id: string
  name: string
  email: string
  phone: string | null
  createdAt: string
  appointmentCount: number
}

export type AdminClientDetail = {
  id: string
  name: string
  email: string
  phone: string | null
  notes: string | null
  createdAt: Date
  appointments: AdminClientAppointments[]
  _count: { appointments: number }
}

export type AdminClientAppointments = {
  id: string
  startsAt: Date
  endsAt: Date
  status: AppointmentStatus
  service: { id: string; name: string }
}

export type ClientPage<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type ClientWithBookings = {
  client: AdminClientDetail
  bookings: ClientPage<AdminClientAppointments>
}
