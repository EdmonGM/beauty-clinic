"use client"

import { useRouter } from "next/navigation"
import { AppointmentCard } from "./appointment-card"
import { AppointmentWithService } from "@/types/appointment"

type AppointmentsListProps = {
  appointments: AppointmentWithService[]
  emptyMessage: string
}

export function AppointmentsList({
  appointments,
  emptyMessage,
}: AppointmentsListProps) {
  const router = useRouter()

  function handleCancelled() {
    router.refresh()
  }

  if (appointments.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onCancelledAction={handleCancelled}
        />
      ))}
    </div>
  )
}
