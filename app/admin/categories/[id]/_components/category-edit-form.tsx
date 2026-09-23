"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { categorySchema, CategoryInput } from "@/lib/validations"
import { updateCategory } from "@/lib/actions/categories"
import { Button } from "@/components/ui/button"
import { CategoryWithServices } from "@/types/category"
import { CategoryForm } from "@/components/admin/category-form"
import { toast } from "sonner"
import Link from "next/link"

type CategoryEditFormProps = {
  category: CategoryWithServices
}

export function CategoryEditForm({ category }: CategoryEditFormProps) {
  const router = useRouter()
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category.name,
      description: category.description || "",
    },
  })

  async function onSubmit(data: CategoryInput) {
    const result = await updateCategory(category.id, data)

    if (result.success) {
      toast.success("Edit success")
      router.push("/admin/categories")
    }
  }

  return (
    <>
      <CategoryForm form={form} onSubmitAction={onSubmit} />
      <Button type="submit" form="category-form">
        Save Changes
      </Button>
      <Button
        variant="outline"
        render={<Link href="/admin/categories" />}
        nativeButton={false}
      >
        Cancel
      </Button>
    </>
  )
}
