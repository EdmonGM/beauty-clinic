import { getAllServices } from "@/lib/actions/services"
import {
  getAdminAppointments,
  getAdminAppointmentCounts,
} from "@/lib/actions/admin-appointments"
import { AdminAppointmentsFilter } from "@/components/admin/admin-appointments-filter"
import { APPOINTMENT_STATUSES } from "@/lib/appointment-status"
import { AppointmentStatus } from "@/generated/prisma/index"
import { AdminAppointmentsFilterInput } from "@/types/appointment"
import { AppointmentsStatusBadge } from "@/components/admin/appointments-status-badge"
import { AppointmentsTable } from "@/components/admin/appointments-table"

type AdminAppointmentsPageProps = {
  searchParams: Promise<{
    status?: string | string[]
    date?: string | string[]
    serviceId?: string | string[]
    query?: string | string[]
  }>
}

function asString(value?: string | string[]) {
  if (Array.isArray(value)) return value[0]
  return value
}

export default async function AdminAppointmentsPage({
  searchParams,
}: AdminAppointmentsPageProps) {
  const params = await searchParams

  const filter: AdminAppointmentsFilterInput = {
    status: asString(params.status) as AppointmentStatus | undefined,
    date: asString(params.date) || undefined,
    serviceId: asString(params.serviceId) || undefined,
    query: asString(params.query) || undefined,
  }

  const [appointmentsResponse, countsResponse, servicesResponse] =
    await Promise.all([
      getAdminAppointments(filter),
      getAdminAppointmentCounts(),
      getAllServices(),
    ])

  if (
    !appointmentsResponse.success ||
    !countsResponse.success ||
    !servicesResponse.success
  ) {
    console.log(appointmentsResponse)
    console.log(filter)

    return <p>ERROR</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="font-heading text-2xl font-semibold">Appointments</h1>
      </div>

      <AdminAppointmentsFilter
        values={filter}
        services={servicesResponse.data}
      />

      <div className="flex flex-wrap gap-2">
        {APPOINTMENT_STATUSES.map((status) => (
          <div
            key={status}
            className="flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-sm"
          >
            <AppointmentsStatusBadge status={status} />
            <span className="font-medium">{countsResponse.data[status]}</span>
          </div>
        ))}
      </div>

      <AppointmentsTable appointments={appointmentsResponse.data} />
    </div>
  )
}
