"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CancelAppointmentDialog } from "./cancel-appointment-dialog"
import { AppointmentWithService } from "@/types/appointment"
import { formatPrice, formatDuration } from "@/lib/format"
import { STATUS_LABEL, STATUS_BADGE_VARIANT } from "@/lib/appointment-status"
import Link from "next/link"
import { useRouter } from "next/navigation"

type AppointmentCardProps = {
  appointment: AppointmentWithService
  date: "PAST" | "UPCOMING"
}

export function AppointmentCard({ appointment, date }: AppointmentCardProps) {
  const router = useRouter()

  function handleCancelled() {
    router.refresh()
  }
  const [cancelOpen, setCancelOpen] = useState(false)
  const canCancel =
    (appointment.status === "PENDING" || appointment.status === "CONFIRMED") &&
    date === "UPCOMING"

  const canPay = appointment.status === "PENDING" && date === "UPCOMING"

  const statusBadge =
    appointment.status === "PENDING" && appointment.paymentIntentId
      ? { label: "Awaiting Payment", variant: "outline" as const }
      : {
          label: STATUS_LABEL[appointment.status],
          variant: STATUS_BADGE_VARIANT[appointment.status],
        }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">
              {appointment.service.name}
            </CardTitle>
            <Badge variant="secondary" className="w-fit text-xs">
              {appointment.service.category.name}
            </Badge>
          </div>
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="size-4" />
              <span>
                {format(new Date(appointment.startsAt), "EEEE, MMMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4" />
              <span>
                {format(new Date(appointment.startsAt), "h:mm a")} –{" "}
                {format(new Date(appointment.endsAt), "h:mm a")}(
                {formatDuration(appointment.service.durationMinutes)})
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-3 text-sm">
            <span className="text-muted-foreground">
              {formatPrice(appointment.service.price)}
            </span>
            <div className="flex gap-2">
              {canCancel && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setCancelOpen(true)}
                >
                  Cancel
                </Button>
              )}
              {canPay && (
                <Button
                  variant="default"
                  size="sm"
                  render={
                    <Link href={`/appointments/${appointment.id}/payment`} />
                  }
                  nativeButton={false}
                >
                  Pay
                </Button>
              )}
            </div>
          </div>

          {appointment.notes && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Notes: </span>
              {appointment.notes}
            </p>
          )}
        </CardContent>
      </Card>

      <CancelAppointmentDialog
        open={cancelOpen}
        onOpenChangeAction={setCancelOpen}
        appointmentId={appointment.id}
        serviceName={appointment.service.name}
        onCancelledAction={handleCancelled}
      />
    </>
  )
}
