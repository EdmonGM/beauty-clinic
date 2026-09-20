import { getAllCategories } from "@/lib/actions/categories"
import { ServiceCreateForm } from "../[id]/_components/service-create-form"

export default async function AdminCreateServicePage() {
  const categories = await getAllCategories()
  if (!categories.success) return <p>Error fetching categories.</p>

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold">
        Create New Service
      </h1>
      <ServiceCreateForm categories={categories.data} />
    </div>
  )
}
