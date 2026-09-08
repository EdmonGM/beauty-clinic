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

type AppointmentCardProps = {
  appointment: AppointmentWithService
  onCancelledAction: () => void
}

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "outline",
  CONFIRMED: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
  NO_SHOW: "destructive",
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
}

export function AppointmentCard({
  appointment,
  onCancelledAction,
}: AppointmentCardProps) {
  const [cancelOpen, setCancelOpen] = useState(false)
  const canCancel =
    appointment.status === "PENDING" || appointment.status === "CONFIRMED"

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
          <Badge variant={STATUS_VARIANT[appointment.status]}>
            {STATUS_LABEL[appointment.status]}
          </Badge>
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
            {canCancel && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setCancelOpen(true)}
              >
                Cancel
              </Button>
            )}
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
        onCancelledAction={onCancelledAction}
      />
    </>
  )
}
