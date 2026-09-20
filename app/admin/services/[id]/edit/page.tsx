import { notFound } from "next/navigation"
import { ServiceEditForm } from "../_components/service-edit-form"
import { getServiceByIdAdmin } from "@/lib/actions/services"
import { getAllCategories } from "@/lib/actions/categories"

export default async function AdminEditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [service, categories] = await Promise.all([
    getServiceByIdAdmin(id),
    getAllCategories(),
  ])

  if (!service.success) {
    return <p>ERROR</p>
  }

  if (!service.data || !categories.success) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold">Edit Service</h1>
      <ServiceEditForm categories={categories.data} service={service.data} />
    </div>
  )
}
