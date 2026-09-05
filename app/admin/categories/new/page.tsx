import { CategoryCreateForm } from "../[id]/_components/category-create-form"

export default async function AdminCreateCategoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold">
        Create New Category
      </h1>
      <CategoryCreateForm />
    </div>
  )
}
