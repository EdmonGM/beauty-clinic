"use server"

import { prisma } from "@/lib/prisma"
import { ActionResponse } from "@/types/action-response"
import { CategoryInput } from "@/lib/validations"
import { CategoryWithServices } from "@/types/category"
import { requireAdmin } from "../auth-server-hooks"

export async function getAllCategories(): Promise<
  ActionResponse<CategoryWithServices[]>
> {
  try {
    const categories = await prisma.category.findMany({
      include: { services: true },
      orderBy: { name: "asc" },
    })

    return {
      success: true,
      data: categories,
      message: "Get categories success",
    }
  } catch (error) {
    return {
      success: false,
      error,
      message: "Get categories error",
    }
  }
}

export async function getCategoryById(
  id: string
): Promise<ActionResponse<CategoryWithServices | null>> {
  try {
    await requireAdmin()
    const category = await prisma.category.findFirst({
      where: { id },
      include: { services: true },
    })

    return {
      success: true,
      data: category,
      message: "Get category by id success",
    }
  } catch (error) {
    return {
      success: false,
      error,
      message: "Get category by id error",
    }
  }
}

export async function createCategory(
  input: CategoryInput
): Promise<ActionResponse<string>> {
  try {
    await requireAdmin()
    const category = await prisma.category.create({
      data: {
        name: input.name,
        description: input.description,
      },
    })
    return {
      success: true,
      data: category.id,
      message: "Category created",
    }
  } catch (error) {
    return {
      success: false,
      error,
      message: "Failed to create category",
    }
  }
}

export async function updateCategory(
  id: string,
  input: CategoryInput
): Promise<ActionResponse<string>> {
  try {
    await requireAdmin()
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
      },
    })
    return {
      success: true,
      data: category.id,
      message: "Category updated",
    }
  } catch (error) {
    return {
      success: false,
      error,
      message: "Failed to update category",
    }
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
      return {
        success: false,
        error: null,
        message: "Cannot delete a category with existing services",
      }
    }
    await prisma.category.delete({ where: { id } })
    return {
      success: true,
      data: null,
      message: "Category deleted",
    }
  } catch (error) {
    return {
      success: false,
      error,
      message: "Failed to delete category",
    }
  }
}
