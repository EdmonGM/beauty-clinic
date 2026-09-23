import { getClinicAvailability } from "@/lib/actions/availability"
import { getBlockedSlots } from "@/lib/actions/blocked-slots"
import { AvailabilityTable } from "@/components/admin/availability-table"
import { BlockedSlotsTable } from "@/components/admin/blocked-slots-table"

export default async function AdminAvailabilityPage() {
  const [availabilityResponse, blockedSlotsResponse] = await Promise.all([
    getClinicAvailability(),
    getBlockedSlots(),
  ])

  if (!availabilityResponse.success || !blockedSlotsResponse.success) {
    return <p>ERROR</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">
          Clinic Availability
        </h1>
      </div>
      <AvailabilityTable availability={availabilityResponse.data} />
      <div className="pt-4">
        <h2 className="font-heading text-xl font-semibold">Blocked Slots</h2>
        <BlockedSlotsTable blockedSlots={blockedSlotsResponse.data} />
      </div>
    </div>
  )
}