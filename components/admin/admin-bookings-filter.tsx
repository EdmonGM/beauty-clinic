"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SearchIcon } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AdminAppointmentsFilter } from "@/types/appointment"
import { APPOINTMENT_STATUSES, STATUS_LABEL } from "@/lib/appointment-status"
import { ServiceWithCategory } from "@/types/service"

type AdminBookingsFilterProps = {
  values: AdminAppointmentsFilter
  services: ServiceWithCategory[]
}

const ALL = "all"

export function AdminBookingsFilter({
  values,
  services,
}: AdminBookingsFilterProps) {
  const router = useRouter()
  const [query, setQuery] = useState(values.query ?? "")

  function updateParams(overrides: AdminAppointmentsFilter) {
    const params = new URLSearchParams()
    const next = { ...values, ...overrides }
    if (next.status) params.set("status", next.status)
    if (next.date) params.set("date", next.date)
    if (next.serviceId) params.set("serviceId", next.serviceId)
    if (next.query) params.set("query", next.query)

    const qs = params.toString()
    router.replace(qs ? `/admin/bookings?${qs}` : "/admin/bookings")
  }

  function handleSearch(event: any) {
    event.preventDefault()
    updateParams({ query: query.trim() || undefined })
  }

  function handleReset() {
    setQuery("")
    updateParams({
      status: undefined,
      date: undefined,
      serviceId: undefined,
      query: undefined,
    })
  }

  function toParam(v: string) {
    return v === ALL ? undefined : v
  }

  const hasFilters = Object.values(values).some(Boolean)

  return (
    <div className="flex flex-col gap-4 rounded-2xl border p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">Status</Label>
          <Select
            value={values.status ?? ALL}
            onValueChange={(v) =>
              updateParams({
                status: v ? toParam(v) : undefined,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {APPOINTMENT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABEL[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">Date</Label>
          <Input
            type="date"
            value={values.date ?? ""}
            onChange={(e) =>
              updateParams({ date: e.target.value || undefined })
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">Service</Label>
          <Select
            value={values.serviceId ?? ALL}
            onValueChange={(v) =>
              updateParams({
                serviceId: v ? toParam(v) : undefined,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All services</SelectItem>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">Client</Label>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="search"
              placeholder="Search name or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit" variant="outline" size="icon">
              <SearchIcon />
            </Button>
          </form>
        </div>
      </div>

      {hasFilters && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset filters
          </Button>
        </div>
      )}
    </div>
  )
}
