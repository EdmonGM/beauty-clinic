import { getClinicAvailability } from "@/lib/actions/availability"
import { AvailabilityTable } from "@/components/admin/availability-table"

export default async function AdminAvailabilityPage() {
  const response = await getClinicAvailability()

  if (!response.success) {
    return <p>ERROR</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">
          Clinic Availability
        </h1>
      </div>
      <AvailabilityTable availability={response.data} />
    </div>
  )
}