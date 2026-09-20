"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { getClientById } from "@/lib/actions/users"
import { AdminClientAppointments } from "@/types/user"
import { AppointmentsStatusBadge } from "./appointments-status-badge"

type ClientAppointmentsTableProps = {
  clientId: string
  initialAppointments: AdminClientAppointments[]
}

export function ClientAppointmentsTable({
  clientId,
  initialAppointments,
}: ClientAppointmentsTableProps) {
  const [appointments, setAppointments] =
    useState<AdminClientAppointments[]>(initialAppointments)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    setIsPending(true)
    getClientById(clientId)
      .then((res) => {
        if (res.success && res.data) {
          setError(null)
          setAppointments(res.data.appointments)
        } else {
          setError(res.message)
        }
      })
      .finally(() => setIsPending(false))
  }, [clientId])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Error while fetching appointments.
        </p>
      </div>
    )
  }

  if (isPending && appointments.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center">
        <p className="text-muted-foreground">No Appointments yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Date &amp; Time</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((app) => (
            <TableRow key={app.id}>
              <TableCell>{app.service.name}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>
                    {format(new Date(app.startsAt), "EEE, MMM d, yyyy")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(app.startsAt), "h:mm a")} –{" "}
                    {format(new Date(app.endsAt), "h:mm a")}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <AppointmentsStatusBadge status={app.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
