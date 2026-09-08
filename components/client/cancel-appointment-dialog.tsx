"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cancelAppointment } from "@/lib/actions/appointments"
import { useTransition } from "react"

type CancelAppointmentDialogProps = {
  open: boolean
  onOpenChangeAction: (open: boolean) => void
  appointmentId: string
  serviceName: string
  onCancelledAction: () => void
}

export function CancelAppointmentDialog({
  open,
  onOpenChangeAction,
  appointmentId,
  serviceName,
  onCancelledAction,
}: CancelAppointmentDialogProps) {
  const [isPending, startTransition] = useTransition()

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelAppointment(appointmentId)
      if (result.success) {
        onOpenChangeAction(false)
        onCancelledAction()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel your <strong>{serviceName}</strong>{" "}
            appointment? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChangeAction(false)}
            disabled={isPending}
          >
            Keep Appointment
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isPending}
          >
            {isPending ? "Cancelling..." : "Cancel Appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
