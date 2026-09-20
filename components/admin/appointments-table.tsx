"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  CalendarClockIcon,
  CheckCheckIcon,
  CheckIcon,
  MoreVerticalIcon,
  UserXIcon,
  XIcon,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AppointmentActionDialog } from "./appointment-action-dialog"
import { RescheduleAppointmentDialog } from "./reschedule-appointment-dialog"
import { AdminAppointment } from "@/types/appointment"
import { AppointmentStatus } from "@/generated/prisma/index"
import {
  canReschedule,
  canUpdateAppointmentStatus,
  STATUS_LABEL,
} from "@/lib/appointment-status"
import { formatDuration, formatPrice } from "@/lib/format"
import { updateAppointmentStatus } from "@/lib/actions/admin-appointments"
import { ActionResponse } from "@/lib/action-response"
import { AppointmentsStatusBadge } from "./appointments-status-badge"

type AppointmentsTableProps = {
  appointments: AdminAppointment[]
}

type ActionTarget = {
  appointment: AdminAppointment
  status: AppointmentStatus
}

type StatusActionMeta = {
  label: string
  confirmLabel: string
  note: string
  icon: typeof CheckIcon
  destructive: boolean
}

const STATUS_ACTION_META: Partial<Record<AppointmentStatus, StatusActionMeta>> =
  {
    CONFIRMED: {
      label: "Confirm",
      confirmLabel: "Confirm",
      note: "Confirm this appointment?",
      icon: CheckIcon,
      destructive: false,
    },
    COMPLETED: {
      label: "Mark Completed",
      confirmLabel: "Mark Completed",
      note: "Mark this appointment as completed?",
      icon: CheckCheckIcon,
      destructive: false,
    },
    NO_SHOW: {
      label: "Mark No-Show",
      confirmLabel: "Mark No-Show",
      note: "Mark this appointment as a no-show?",
      icon: UserXIcon,
      destructive: true,
    },
    CANCELLED: {
      label: "Cancel Booking",
      confirmLabel: "Cancel Booking",
      note: "Cancel this appointment?",
      icon: XIcon,
      destructive: true,
    },
  }

export function AppointmentsTable({ appointments }: AppointmentsTableProps) {
  const [actionTarget, setActionTarget] = useState<ActionTarget | null>(null)
  const [rescheduleTarget, setRescheduleTarget] =
    useState<AdminAppointment | null>(null)

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
        <p className="text-muted-foreground">
          No Appointments match your filters.
        </p>
      </div>
    )
  }

  function handleStatusAction(): Promise<ActionResponse<unknown>> {
    if (!actionTarget) {
      return Promise.resolve({
        success: false,
        error: null,
        message: "No appointment selected",
      })
    }
    return updateAppointmentStatus(
      actionTarget.appointment.id,
      actionTarget.status
    )
  }

  const dialogMeta = actionTarget
    ? STATUS_ACTION_META[actionTarget.status]
    : null

  return (
    <>
      <div className="rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date &amp; Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => {
              const reschedulable = canReschedule(appointment.status)
              const actionEntries = Object.entries(STATUS_ACTION_META).filter(
                ([status]) =>
                  canUpdateAppointmentStatus(
                    appointment.status,
                    status as AppointmentStatus
                  )
              )

              return (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {appointment.client.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {appointment.client.email}
                      </span>
                      {appointment.client.phone && (
                        <span className="text-xs text-muted-foreground">
                          {appointment.client.phone}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex max-w-52 flex-col gap-1">
                      <span>{appointment.service.name}</span>
                      <Badge variant="secondary" className="w-fit text-xs">
                        {appointment.service.category.name}
                      </Badge>
                      {appointment.notes && (
                        <span
                          className="truncate text-xs text-muted-foreground"
                          title={appointment.notes}
                        >
                          {appointment.notes}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>
                        {format(
                          new Date(appointment.startsAt),
                          "EEE, MMM d, yyyy"
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(appointment.startsAt), "h:mm a")} –{" "}
                        {format(new Date(appointment.endsAt), "h:mm a")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDuration(appointment.service.durationMinutes)}
                  </TableCell>
                  <TableCell>
                    {formatPrice(appointment.service.price)}
                  </TableCell>
                  <TableCell>
                    <AppointmentsStatusBadge status={appointment.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon-sm" />}
                      >
                        <MoreVerticalIcon />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {reschedulable && (
                          <DropdownMenuItem
                            onClick={() => setRescheduleTarget(appointment)}
                          >
                            <CalendarClockIcon />
                            Reschedule
                          </DropdownMenuItem>
                        )}
                        {actionEntries.map(([status, meta]) => (
                          <DropdownMenuItem
                            key={status}
                            variant={
                              meta.destructive ? "destructive" : "default"
                            }
                            onClick={() =>
                              setActionTarget({
                                appointment,
                                status: status as AppointmentStatus,
                              })
                            }
                          >
                            <meta.icon />
                            {meta.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AppointmentActionDialog
        open={actionTarget !== null && dialogMeta !== null}
        onOpenChangeAction={(open) => {
          if (!open) setActionTarget(null)
        }}
        title={
          actionTarget
            ? `${dialogMeta?.label} — ${actionTarget.appointment.service.name}`
            : ""
        }
        description={
          actionTarget && dialogMeta
            ? `${dialogMeta.note} ${STATUS_LABEL[actionTarget.appointment.status].toLowerCase()} appointment for ${actionTarget.appointment.client.name} on ${format(
                new Date(actionTarget.appointment.startsAt),
                "MMM d, yyyy"
              )}.`
            : ""
        }
        confirmLabel={dialogMeta?.confirmLabel ?? ""}
        destructive={dialogMeta?.destructive ?? false}
        onConfirmAction={handleStatusAction}
      />

      <RescheduleAppointmentDialog
        open={rescheduleTarget !== null}
        onOpenChangeAction={(open) => {
          if (!open) setRescheduleTarget(null)
        }}
        appointment={rescheduleTarget}
      />
    </>
  )
}
