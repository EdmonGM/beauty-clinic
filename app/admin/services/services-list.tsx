"use client"

import { useState } from "react"
import { AdminServiceCard } from "@/components/admin/service-card"
import { DeleteServiceDialog } from "@/components/admin/delete-service-dialog"
import { ServiceWithCategory } from "@/types/service"

type ServicesListProps = {
  services: ServiceWithCategory[]
}

export function ServicesList({ services }: ServicesListProps) {
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    name: string
  } | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {services.map((service) => (
          <AdminServiceCard
            key={service.id}
            service={service}
            onDeleteAction={(id, name) => setDeleteTarget({ id, name })}
          />
        ))}
      </div>

      <DeleteServiceDialog
        open={deleteTarget !== null}
        onOpenChangeAction={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        serviceId={deleteTarget?.id ?? ""}
        serviceName={deleteTarget?.name ?? ""}
      />
    </>
  )
}
