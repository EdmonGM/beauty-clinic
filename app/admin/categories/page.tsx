import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { CategoriesList } from "./categories-list"
import { getAllCategories } from "@/lib/actions/categories"
import Link from "next/link"

export default async function AdminCategoriesPage() {
  const response = await getAllCategories()

  if (!response.success) {
    return <p>ERROR</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Categories</h1>
        <Button
          render={<Link href="/admin/categories/new" />}
          nativeButton={false}
        >
          <PlusIcon />
          Add Category
        </Button>
      </div>

      {response.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No categories yet.</p>
          <Button
            variant="link"
            render={<Link href="/admin/categories/new" />}
            className="mt-2"
            nativeButton={false}
          >
            Create your first category
          </Button>
        </div>
      ) : (
        <CategoriesList categories={response.data} />
      )}
    </div>
  )
}
