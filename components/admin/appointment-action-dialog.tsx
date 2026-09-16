"use client"

import { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ActionResponse } from "@/lib/action-response"

type AppointmentActionDialogProps = {
  open: boolean
  onOpenChangeAction: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  destructive?: boolean
  onConfirmAction: () => Promise<ActionResponse<unknown>>
}

export function AppointmentActionDialog({
  open,
  onOpenChangeAction,
  title,
  description,
  confirmLabel,
  destructive = false,
  onConfirmAction,
}: AppointmentActionDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleConfirm() {
    setError(null)
    startTransition(async () => {
      const result = await onConfirmAction()
      if (result.success) {
        onOpenChangeAction(false)
        window.location.reload()
      } else {
        setError(result.message)
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setError(null)
        onOpenChangeAction(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {error && (
          <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChangeAction(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "Working..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
