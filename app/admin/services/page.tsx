import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { ServicesList } from "./services-list"
import { getAllServices } from "@/lib/actions/services"
import Link from "next/link"

export default async function AdminServicesPage() {
  const response = await getAllServices()
  console.log(response)

  if (!response.success) {
    return <p>ERROR</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Services</h1>
        <Button
          render={<Link href="/admin/services/new" />}
          nativeButton={false}
        >
          <PlusIcon />
          Add Service
        </Button>
      </div>

      {response.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No services yet.</p>
          <Button
            variant="link"
            render={<Link href="/admin/services/new" />}
            nativeButton={false}
            className="mt-2"
          >
            Create your first service
          </Button>
        </div>
      ) : (
        <ServicesList services={response.data} />
      )}
    </div>
  )
}
