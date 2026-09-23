"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Clock, ArrowLeft, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice, formatDuration } from "@/lib/format"
import { AvailableSlot } from "@/types/appointment"
import {
  getAvailableSlots,
  createAppointment,
} from "@/lib/actions/appointments"
import { BookingInput, bookingSchema } from "@/lib/validations"

type BookingWidgetProps = {
  service: {
    id: string
    name: string
    price: number
    durationMinutes: number
    category: { name: string }
  }
}

const today = new Date()
today.setHours(0, 0, 0, 0)

export function BookingWidget({ service }: BookingWidgetProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
  })

  const date = watch("date")
  const slot = watch("slot")
  const notes = watch("notes")

  useEffect(() => {
    if (!date) return
    setValue("slot", undefined as unknown as AvailableSlot)
    setError(null)
    setSlotsLoading(true)

    getAvailableSlots(service.id, format(date, "yyyy-MM-dd"))
      .then((result) => {
        if (result.success) {
          setSlots(result.data)
        } else {
          setError(result.message)
          setSlots([])
        }
      })
      .catch(() => {
        setError("Failed to load available times")
        setSlots([])
      })
      .finally(() => setSlotsLoading(false))
  }, [date, service.id, setValue])

  function formatSlotTime(isoStr: string) {
    return format(new Date(isoStr), "h:mm a")
  }

  function handleBack() {
    setValue("slot", undefined as unknown as AvailableSlot)
    setError(null)
  }

  const onConfirm = handleSubmit((values) => {
    setError(null)
    startTransition(async () => {
      try {
        const result = await createAppointment({
          serviceId: service.id,
          date: format(values.date, "yyyy-MM-dd"),
          timeSlot: format(new Date(values.slot.startsAt), "HH:mm"),
          notes: values.notes || undefined,
        })
        if (result.success && result.data) {
          router.push(`/appointments/${result.data}/payment`)
        } else {
          setError(result.message)
          setValue("slot", undefined as unknown as AvailableSlot)
        }
      } catch {
        setError("Something went wrong. Please try again.")
        setValue("slot", undefined as unknown as AvailableSlot)
      }
    })
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book Appointment</CardTitle>
        <CardDescription>
          {service.name} · {formatPrice(service.price)} ·{" "}
          {formatDuration(service.durationMinutes)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {error && (
          <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {!slot ? (
          <>
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Select a date</Label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setValue("date", d)}
                disabled={(d) => d < today}
                className="w-fit rounded-md border"
              />
              {errors.date && (
                <p className="text-sm text-destructive">
                  {errors.date.message}
                </p>
              )}
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
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {slots.map((s, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setValue("slot", s)}
                        className="gap-1.5"
                      >
                        <Clock className="size-3" />
                        {formatSlotTime(s.startsAt)}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium">Confirm your booking</h3>
              <div className="rounded-md border p-4">
                <dl className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Service</dt>
                    <dd className="font-medium">{service.name}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Category</dt>
                    <dd>
                      <Badge variant="secondary">{service.category.name}</Badge>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Date</dt>
                    <dd className="font-medium">
                      {format(date, "EEEE, MMMM d, yyyy")}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Time</dt>
                    <dd className="font-medium">
                      {formatSlotTime(slot.startsAt)} –{" "}
                      {formatSlotTime(slot.endsAt)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Duration</dt>
                    <dd className="font-medium">
                      {formatDuration(service.durationMinutes)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <dt className="text-muted-foreground">Price</dt>
                    <dd className="font-medium">
                      {formatPrice(service.price)}
                    </dd>
                  </div>
                </dl>
              </div>
              {notes && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Notes: </span>
                  {notes}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes (optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Any special requests or information..."
                value={notes ?? ""}
                onChange={(e) => setValue("notes", e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isPending}
                className="gap-1.5"
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isPending}
                className="flex-1"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
