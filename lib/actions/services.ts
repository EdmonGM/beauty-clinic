"use server"

import { prisma } from "@/lib/prisma"
import {
  actionError,
  ActionResponse,
  actionSuccess,
} from "@/lib/action-response"
import { serviceSchema, ServiceInput } from "@/lib/validations"
import { ServiceWithCategory } from "@/types/service"
import { requireAdmin } from "../auth-server-hooks"

export async function getAllServices(): Promise<
  ActionResponse<ServiceWithCategory[]>
> {
  try {
    await requireAdmin()
    const services = await prisma.service.findMany({
      include: { category: true },
      orderBy: { name: "asc" },
    })

    return actionSuccess(services, "Get services success")
  } catch (error) {
    return actionError(error, "Get services error")
  }
}

export async function getServiceByIdAdmin(
  id: string
): Promise<ActionResponse<ServiceWithCategory | null>> {
  try {
    await requireAdmin()
    const service = await prisma.service.findFirst({
      where: { id },
      include: { category: true },
    })

    return actionSuccess(service, "Get service by id success")
  } catch (error) {
    return actionError(error, "Get service by id error")
  }
}

export async function getActiveServices(
  categoryName?: string
): Promise<ActionResponse<ServiceWithCategory[]>> {
  try {
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        ...(categoryName ? { category: { name: categoryName } } : {}),
      },
      include: { category: true },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    })

    return actionSuccess(services, "Get active survices success")
  } catch (error) {
    return actionError(error, "Get active services failed")
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
    return actionSuccess(services, "Get featured survices success")
  } catch (error) {
    return actionError(error, "Get featured services failed")
  }
}

export async function getServiceById(
  id: string
): Promise<ActionResponse<ServiceWithCategory | null>> {
  try {
    const service = await prisma.service.findFirst({
      where: { id, isActive: true },
      include: { category: true },
    })

    return actionSuccess(service, "Get service by id success")
  } catch (error) {
    return actionError(error, "Get service by id error")
  }
}

export async function createService(
  input: ServiceInput
): Promise<ActionResponse<string>> {
  try {
    await requireAdmin()
    const data = serviceSchema.parse(input)
    const service = await prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        durationMinutes: data.durationMinutes,
        categoryId: data.categoryId,
        isActive: data.isActive,
      },
    })
    return actionSuccess(service.id, "Service created")
  } catch (error) {
    return actionError(error, "Failed to create service")
  }
}

export async function updateService(
  id: string,
  input: ServiceInput
): Promise<ActionResponse<string>> {
  try {
    await requireAdmin()
    const data = serviceSchema.parse(input)
    const service = await prisma.service.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        durationMinutes: data.durationMinutes,
        categoryId: data.categoryId,
        isActive: data.isActive,
      },
    })
    return actionSuccess(service.id, "Service updated")
  } catch (error) {
    return actionError(error, "Failed to update service")
  }
}

export async function toggleServiceActive(
  id: string
): Promise<ActionResponse<boolean>> {
  try {
    await requireAdmin()
    const service = await prisma.service.findFirst({ where: { id } })
    if (!service) return actionError(null, "Service not found")
    const updated = await prisma.service.update({
      where: { id },
      data: { isActive: !service.isActive },
    })
    return actionSuccess(updated.isActive, "Service status updated")
  } catch (error) {
    return actionError(error, "Failed to update service")
  }
}

export async function deleteService(id: string): Promise<ActionResponse<null>> {
  try {
    await requireAdmin()
    const appointmentCount = await prisma.appointment.count({
      where: { serviceId: id },
    })
    if (appointmentCount > 0) {
      return actionError(
        null,
        "Cannot delete a service with existing appointments"
      )
    }
    await prisma.service.delete({ where: { id } })
    return actionSuccess(null, "Service deleted")
  } catch (error) {
    return actionError(error, "Failed to delete service")
  }
}
