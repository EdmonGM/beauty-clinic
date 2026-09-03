import { notFound } from "next/navigation"
import { getCategories } from "@/lib/catalog"
import { ServiceEditForm } from "../_components/service-edit-form"
import { getServiceByIdAdmin } from "@/lib/actions/services"

export default async function AdminEditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [service, categories] = await Promise.all([
    getServiceByIdAdmin(id),
    getCategories(),
  ])

  if (!service.success) {
    return <p>ERROR</p>
  }

  if (!service.data) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold">Edit Service</h1>
      <ServiceEditForm categories={categories} service={service.data} />
    </div>
  )
}
