import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { getClientAppointments } from "@/lib/actions/appointments"
import { AppointmentCard } from "@/components/client/appointment-card"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "My Appointments",
}

export default async function AppointmentsPage() {
  const result = await getClientAppointments()

  if (!result.success || !result.data) {
    return (
      <div className="flex flex-col gap-6 py-10">
        <h1 className="font-heading text-2xl font-medium tracking-tight">
          My Appointments
        </h1>
        <p className="text-sm text-muted-foreground">
          Something went wrong loading your appointments. Please try again
          later.
        </p>
      </div>
    )
  }

  const appointments = result.data
  const now = new Date()

  const upcoming = appointments.filter(
    (a) =>
      new Date(a.startsAt) >= now &&
      (a.status === "PENDING" || a.status === "CONFIRMED")
  )
  const past = appointments.filter(
    (a) =>
      new Date(a.startsAt) < now ||
      a.status === "COMPLETED" ||
      a.status === "CANCELLED" ||
      a.status === "NO_SHOW"
  )

  return (
    <div className="flex flex-col gap-8 py-10">
      <h1 className="font-heading text-2xl font-medium tracking-tight">
        My Appointments
      </h1>

      {appointments.length === 0 ? (
        <div className="flex flex-col items-start gap-4">
          <p className="text-muted-foreground">
            You don&apos;t have any appointments yet.
          </p>
          <Button render={<Link href="/services" />}>Browse services</Button>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="font-heading text-lg font-medium">Upcoming</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {upcoming.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    date="UPCOMING"
                  />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="font-heading text-lg font-medium">Past</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {past.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    date="PAST"
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
