import { Skeleton } from "@/components/ui/skeleton"

export default function AdminBookingsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-32 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}