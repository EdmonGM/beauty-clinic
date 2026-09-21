"use client"

import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AvailabilityForm } from "./availability-form"
import {
  createAvailability,
  deleteAvailability,
  updateAvailability,
} from "@/lib/actions/availability"
import {
  createAvailabilitySchema,
  CreateAvailabilityInput,
  UpdateAvailabilityInput,
} from "@/lib/validations/availability"
import { Availability } from "@/generated/prisma"
import { TrashIcon } from "lucide-react"

type AvailabilityModalProps = {
  open: boolean
  onOpenChangeAction: (open: boolean) => void
  availability?: Availability | null
}

export function AvailabilityModal({
  open,
  onOpenChangeAction,
  availability,
}: AvailabilityModalProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const isEdit = availability !== undefined && availability !== null

  const form = useForm<CreateAvailabilityInput>({
    resolver: zodResolver(createAvailabilitySchema),
    defaultValues: {
      dayOfWeek: "MONDAY",
      startTime: "",
      endTime: "",
    },
  })

  useEffect(() => {
    if (isEdit && availability) {
      form.reset({
        dayOfWeek: availability.dayOfWeek,
        startTime: availability.startTime,
        endTime: availability.endTime,
      })
    } else {
      form.reset({
        dayOfWeek: "MONDAY",
        startTime: "",
        endTime: "",
      })
    }
  }, [availability, open, form])

  async function handleSubmit(data: CreateAvailabilityInput) {
    setError(null)
    startTransition(async () => {
      const result = isEdit
        ? await updateAvailability(
            availability!.id,
            data as UpdateAvailabilityInput
          )
        : await createAvailability(data)
      if (result.success) {
        onOpenChangeAction(false)
        window.location.reload()
      } else {
        setError(result.message)
      }
    })
  }

  async function handleDelete() {
    if (!availability) return
    setError(null)
    startTransition(async () => {
      const result = await deleteAvailability(availability.id)
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
          <DialogTitle>
            {isEdit ? "Edit Availability" : "Create Availability"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update hours for ${availability!.dayOfWeek.charAt(0)}${availability!.dayOfWeek.slice(1).toLowerCase()}.`
              : "Set the clinic hours for a specific day."}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <AvailabilityForm form={form} onSubmitAction={handleSubmit} />
        <DialogFooter>
          {isEdit && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              <TrashIcon />
              Delete
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChangeAction(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form="availability-form" disabled={isPending}>
            {isPending ? "Working..." : isEdit ? "Save Changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
