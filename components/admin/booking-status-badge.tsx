import { Badge } from "@/components/ui/badge"
import { AppointmentStatus } from "@/generated/prisma/index"
import { STATUS_BADGE_VARIANT, STATUS_LABEL } from "@/lib/appointment-status"

export function BookingStatusBadge({
  status,
}: {
  status: AppointmentStatus
}) {
  return (
    <Badge variant={STATUS_BADGE_VARIANT[status]}>
      {STATUS_LABEL[status]}
    </Badge>
  )
}