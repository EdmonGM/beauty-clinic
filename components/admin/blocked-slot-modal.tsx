"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BlockedSlotForm } from "./blocked-slot-form"
import {
  createBlockedSlot,
  deleteBlockedSlot,
  updateBlockedSlot,
} from "@/lib/actions/blocked-slots"
import { ActionResponse } from "@/lib/action-response"
import {
  createBlockedSlotSchema,
  CreateBlockedSlotInput,
  UpdateBlockedSlotInput,
} from "@/lib/validations/blocked-slots"
import { BlockedSlot } from "@/generated/prisma"
import { toast } from "sonner"
import { TrashIcon } from "lucide-react"

type BlockedSlotModalProps = {
  open: boolean
  onOpenChangeAction: (open: boolean) => void
  blockedSlot?: BlockedSlot | null
}

export function BlockedSlotModal({
  open,
  onOpenChangeAction,
  blockedSlot,
}: BlockedSlotModalProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const isEdit = blockedSlot !== undefined && blockedSlot !== null

  const form = useForm<CreateBlockedSlotInput>({
    resolver: zodResolver(createBlockedSlotSchema),
    defaultValues: isEdit
      ? {
          startsAt: format(
            new Date(blockedSlot.startsAt),
            "yyyy-MM-dd'T'HH:mm"
          ),
          endsAt: format(new Date(blockedSlot.endsAt), "yyyy-MM-dd'T'HH:mm"),
          reason: blockedSlot.reason || "",
        }
      : {
          startsAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          endsAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          reason: "",
        },
  })

  async function handleSubmit(data: CreateBlockedSlotInput) {
    setError(null)
    startTransition(async () => {
      const result = isEdit
        ? await updateBlockedSlot(
            blockedSlot!.id,
            data as UpdateBlockedSlotInput
          )
        : await createBlockedSlot(data)
      if (result.success) {
        onOpenChangeAction(false)
        window.location.reload()
      } else {
        setError(result.message)
      }
    })
  }

  async function handleDelete() {
    if (!blockedSlot) return
    setError(null)
    startTransition(async () => {
      const result = await deleteBlockedSlot(blockedSlot.id)
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
            {isEdit ? "Edit Blocked Slot" : "Block a Slot"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update blocked slot on ${format(new Date(blockedSlot.startsAt), "MMM d, yyyy")}.`
              : "Block a time slot when the clinic is unavailable."}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <BlockedSlotForm form={form} onSubmitAction={handleSubmit} />
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
          <Button type="submit" form="blocked-slot-form" disabled={isPending}>
            {isPending ? "Working..." : isEdit ? "Save Changes" : "Block Slot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
