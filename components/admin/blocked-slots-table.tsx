"use client"

import { useState } from "react"
import { format } from "date-fns"
import { PencilIcon, TrashIcon } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BlockedSlotModal } from "./blocked-slot-modal"
import { BlockedSlot } from "@/generated/prisma"

type BlockedSlotsTableProps = {
  blockedSlots: BlockedSlot[]
}

export function BlockedSlotsTable({ blockedSlots }: BlockedSlotsTableProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<BlockedSlot | null>(null)

  function openCreate() {
    setSelected(null)
    setModalOpen(true)
  }

  function openEdit(slot: BlockedSlot) {
    setSelected(slot)
    setModalOpen(true)
  }

  return (
    <>
      <div className="flex items-center justify-between pb-2">
        <div />
        <Button onClick={openCreate} size="sm">
          Add Blocked Slot
        </Button>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time Range</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blockedSlots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No blocked slots.
                  </TableCell>
                </TableRow>
              ) : (
                blockedSlots.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell>
                      <span className="font-medium">
                        {format(new Date(slot.startsAt), "MMM d, yyyy")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {format(new Date(slot.startsAt), "h:mm a")} –{" "}
                        {format(new Date(slot.endsAt), "h:mm a")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {slot.reason || "No reason given"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(slot)}
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(slot)}
                        >
                          <TrashIcon />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <BlockedSlotModal
        open={modalOpen}
        onOpenChangeAction={(next) => {
          if (!next) setModalOpen(false)
        }}
        blockedSlot={selected}
      />
    </>
  )
}