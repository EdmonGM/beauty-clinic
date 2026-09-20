"use client"

import { useEffect, useState, useTransition } from "react"
import { format } from "date-fns"
import { Clock, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AdminAppointment, AvailableSlot } from "@/types/appointment"
import { formatDuration, formatPrice } from "@/lib/format"
import { rescheduleAppointment } from "@/lib/actions/admin-appointments"
import { generateAvailableSlots } from "@/lib/slot-generator"

type RescheduleAppointmentDialogProps = {
  open: boolean
  onOpenChangeAction: (open: boolean) => void
  appointment: AdminAppointment | null
}

const today = new Date()
today.setHours(0, 0, 0, 0)

export function RescheduleAppointmentDialog({
  open,
  onOpenChangeAction,
  appointment,
}: RescheduleAppointmentDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [date, setDate] = useState<Date | null>(null)
  const [slot, setSlot] = useState<AvailableSlot | null>(null)
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setDate(null)
      setSlot(null)
      setSlots([])
      setError(null)
      return
    }
    if (!appointment || !date) return

    setSlot(null)
    setError(null)
    setSlotsLoading(true)
    generateAvailableSlots(
      date,
      appointment.service.durationMinutes,
      appointment.id
    )
      .then((slots) => {
        setSlots(slots)
        setError(null)
      })
      .catch(() => {
        setError("Failed to load available times")
        setSlots([])
      })
      .finally(() => setSlotsLoading(false))
  }, [open, appointment, date])

  if (!appointment) return null

  function handleConfirm() {
    if (!appointment || !date || !slot) return
    setError(null)
    startTransition(async () => {
      const result = await rescheduleAppointment(appointment.id, {
        date: format(date, "yyyy-MM-dd"),
        timeSlot: format(new Date(slot.startsAt), "HH:mm"),
      })
      if (result.success) {
        onOpenChangeAction(false)
        window.location.reload()
      } else {
        setError(result.message)
        setSlot(null)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="max-h-4/5 overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>Reschedule {appointment.service.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Select a new date</Label>
            <Calendar
              mode="single"
              selected={date ?? undefined}
              onSelect={(d) => d && setDate(d)}
              disabled={(d) => d < today}
              className="w-fit rounded-md border"
            />
          </div>

          {date && (
            <div className="flex flex-col gap-3">
              <Label className="text-sm font-medium">
                Available times for {format(date, "EEEE, MMMM d, yyyy")}
              </Label>
              {slotsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Loading times...
                </div>
              ) : slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No available times for this date. Try another day.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((s) => (
                    <Button
                      key={s.startsAt}
                      variant="outline"
                      size="sm"
                      onClick={() => setSlot(s)}
                      className="gap-1.5"
                    >
                      <Clock className="size-3" />
                      {format(new Date(s.startsAt), "h:mm a")}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t pt-4">
            {slot && date && (
              <dl className="flex flex-col gap-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">New time</dt>
                  <dd className="font-medium">
                    {format(date, "EEEE, MMMM d, yyyy")} ·{" "}
                    {format(new Date(slot.startsAt), "h:mm a")} –{" "}
                    {format(new Date(slot.endsAt), "h:mm a")}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Service</dt>
                  <dd className="font-medium">{appointment.service.name}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Duration</dt>
                  <dd className="font-medium">
                    {formatDuration(appointment.service.durationMinutes)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Price</dt>
                  <dd className="font-medium">
                    {formatPrice(appointment.service.price)}
                  </dd>
                </div>
              </dl>
            )}

            {error && (
              <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChangeAction(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={!slot || isPending}>
                {isPending ? "Rescheduling..." : "Confirm Reschedule"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
