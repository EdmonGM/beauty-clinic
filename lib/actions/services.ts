"use server"

import { prisma } from "@/lib/prisma"
import { ActionResponse } from "@/types/action-response"
import { ServiceInput } from "@/lib/validations"
import { ServiceWithCategory } from "@/types/service"
import { requireAdmin } from "../auth-server-hooks"

export async function getAllServices({
  isActive,
  categoryName,
}: {
  isActive?: boolean
  categoryName?: string
}): Promise<ActionResponse<ServiceWithCategory[]>> {
  const where: any = {}
  if (isActive !== undefined) {
    where.isActive = isActive
  }
  if (categoryName) {
    where.category = {
      name: categoryName,
    }
  }
  try {
    const services = await prisma.service.findMany({
      where,
      include: { category: true },
      orderBy: { name: "asc" },
    })

    return { success: true, data: services, message: "Get services success" }
  } catch (error) {
    return { success: false, error, message: "Get services error" }
  }
}

export async function getFeaturedServices(
  limit = 4
): Promise<ActionResponse<ServiceWithCategory[]>> {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
      take: limit,
    })
    return {
      success: true,
      data: services,
      message: "Get featured survices success",
    }
  } catch (error) {
    return { success: false, error, message: "Get featured services failed" }
  }
}

export async function getServiceById(
  id: string
): Promise<ActionResponse<ServiceWithCategory | null>> {
  try {
    const service = await prisma.service.findFirst({
      where: { id },
      include: { category: true },
    })

    return {
      success: true,
      data: service,
      message: "Get service by id success",
    }
  } catch (error) {
    return { success: false, error, message: "Get service by id error" }
  }
}

export async function createService(
  input: ServiceInput
): Promise<ActionResponse<string>> {
  try {
    await requireAdmin()
    const service = await prisma.service.create({
      data: {
        name: input.name,
        description: input.description,
        price: input.price,
        durationMinutes: input.durationMinutes,
        categoryId: input.categoryId,
        isActive: input.isActive,
      },
    })
    return { success: true, data: service.id, message: "Service created" }
  } catch (error) {
    return { success: false, error, message: "Failed to create service" }
  }
}

export async function updateService(
  id: string,
  input: ServiceInput
): Promise<ActionResponse<string>> {
  try {
    await requireAdmin()
    const service = await prisma.service.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        price: input.price,
        durationMinutes: input.durationMinutes,
        categoryId: input.categoryId,
        isActive: input.isActive,
      },
    })
    return { success: true, data: service.id, message: "Service updated" }
  } catch (error) {
    return { success: false, error, message: "Failed to update service" }
  }
}

export async function deleteService(id: string): Promise<ActionResponse<null>> {
  try {
    await requireAdmin()
    const appointmentCount = await prisma.appointment.count({
      where: { serviceId: id },
    })
    if (appointmentCount > 0) {
      return {
        success: false,
        error: null,
        message: "Cannot delete a service with existing appointments",
      }
    }
    await prisma.service.delete({ where: { id } })
    return { success: true, data: null, message: "Service deleted" }
  } catch (error) {
    return { success: false, error, message: "Failed to delete service" }
  }
}
