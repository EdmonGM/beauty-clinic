"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { categorySchema, CategoryInput } from "@/lib/validations"
import { createCategory } from "@/lib/actions/categories"
import { Button } from "@/components/ui/button"
import { CategoryForm } from "@/components/admin/category-form"
import { toast } from "sonner"
import Link from "next/link"

export function CategoryCreateForm() {
  const router = useRouter()
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  async function onSubmit(data: CategoryInput) {
    const result = await createCategory(data)

    if (result.success) {
      toast.success("Create category success")
      router.push("/admin/categories")
    }
  }

  return (
    <>
      <CategoryForm form={form} onSubmitAction={onSubmit} />
      <Button type="submit" form="category-form">
        Create Category
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
