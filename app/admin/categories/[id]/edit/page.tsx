import { notFound } from "next/navigation"
import { CategoryEditForm } from "../_components/category-edit-form"
import { getCategoryByIdAdmin } from "@/lib/actions/categories"

export default async function AdminEditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const category = await getCategoryByIdAdmin(id)

  if (!category.success) {
    return <p>ERROR</p>
  }

  if (!category.data) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold">Edit Category</h1>
      <CategoryEditForm category={category.data} />
    </div>
  )
}
