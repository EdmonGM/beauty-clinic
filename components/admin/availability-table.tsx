"use client"

import { useState } from "react"
import {
  PencilIcon,
  PlusIcon,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { AvailabilityModal } from "./availability-modal"
import { Availability } from "@/generated/prisma"

type AvailabilityTableProps = {
  availability: Availability[]
}

const ALL_DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
}

export function AvailabilityTable({
  availability,
}: AvailabilityTableProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<Availability | null>(null)

  function openCreate(day: string) {
    setSelected(null)
    setModalOpen(true)
  }

  function openEdit(av: Availability) {
    setSelected(av)
    setModalOpen(true)
  }

  return (
    <>
      <div className="rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Day</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ALL_DAYS.map((day) => {
              const window = availability.find(
                (a) => a.dayOfWeek === day
              )
              return (
                <TableRow key={day}>
                  <TableCell>
                    <span className="font-medium">{DAY_LABELS[day]}</span>
                  </TableCell>
                  <TableCell>
                    {window ? (
                      <span className="text-sm">
                        {window.startTime} – {window.endTime}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {window ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(window)}
                      >
                        <PencilIcon />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openCreate(day)}
                      >
                        <PlusIcon />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AvailabilityModal
        open={modalOpen}
        onOpenChangeAction={(open) => {
          if (!open) setModalOpen(false)
        }}
        availability={selected}
      />
    </>
  )
}