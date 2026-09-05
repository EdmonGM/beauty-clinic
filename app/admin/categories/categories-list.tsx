"use client"

import { useState } from "react"
import { AdminCategoryCard } from "@/components/admin/category-card"
import { DeleteCategoryDialog } from "@/components/admin/delete-category-dialog"
import { CategoryWithServices } from "@/types/category"

type CategoriesListProps = {
  categories: CategoryWithServices[]
}

export function CategoriesList({ categories }: CategoriesListProps) {
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    name: string
  } | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category) => (
          <AdminCategoryCard
            key={category.id}
            category={category}
            onDeleteAction={(id, name) => setDeleteTarget({ id, name })}
          />
        ))}
      </div>

      <DeleteCategoryDialog
        open={deleteTarget !== null}
        onOpenChangeAction={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        categoryId={deleteTarget?.id ?? ""}
        categoryName={deleteTarget?.name ?? ""}
      />
    </>
  )
}
