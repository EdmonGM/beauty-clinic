"use server"

import { prisma } from "@/lib/prisma"
import {
  actionError,
  ActionResponse,
  actionSuccess,
} from "@/lib/action-response"
import { categorySchema, CategoryInput } from "@/lib/validations"
import { CategoryWithServices } from "@/types/category"
import { getCachedSession, requireAdmin } from "../auth-server-hooks"

export async function getAllCategories(): Promise<
  ActionResponse<CategoryWithServices[]>
> {
  try {
    await requireAdmin()
    const categories = await prisma.category.findMany({
      include: { services: true },
      orderBy: { name: "asc" },
    })

    return actionSuccess(categories, "Get categories success")
  } catch (error) {
    return actionError(error, "Get categories error")
  }
}

export async function getCategoryByIdAdmin(
  id: string
): Promise<ActionResponse<CategoryWithServices | null>> {
  try {
    await requireAdmin()
    const category = await prisma.category.findFirst({
      where: { id },
      include: { services: true },
    })

    return actionSuccess(category, "Get category by id success")
  } catch (error) {
    return actionError(error, "Get category by id error")
  }
}

export async function createCategory(
  input: CategoryInput
): Promise<ActionResponse<string>> {
  try {
    await requireAdmin()
    const data = categorySchema.parse(input)
    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
      },
    })
    return actionSuccess(category.id, "Category created")
  } catch (error) {
    return actionError(error, "Failed to create category")
  }
}

export async function updateCategory(
  id: string,
  input: CategoryInput
): Promise<ActionResponse<string>> {
  try {
    await requireAdmin()
    const data = categorySchema.parse(input)
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
    })
    return actionSuccess(category.id, "Category updated")
  } catch (error) {
    return actionError(error, "Failed to update category")
  }
}

export async function deleteCategory(
  id: string
): Promise<ActionResponse<null>> {
  try {
    await requireAdmin()
    const serviceCount = await prisma.service.count({
      where: { categoryId: id },
    })
    if (serviceCount > 0) {
      return actionError(
        null,
        "Cannot delete a category with existing services"
      )
    }
    await prisma.category.delete({ where: { id } })
    return actionSuccess(null, "Category deleted")
  } catch (error) {
    return actionError(error, "Failed to delete category")
  }
}
