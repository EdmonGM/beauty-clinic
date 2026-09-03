import { getCategories } from "@/lib/catalog"
import { ServiceCreateForm } from "../[id]/_components/service-create-form"

export default async function AdminCreateServicePage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold">
        Create New Service
      </h1>
      <ServiceCreateForm categories={categories} />
    </div>
  )
}
