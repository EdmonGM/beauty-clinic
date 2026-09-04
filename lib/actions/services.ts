"use server"

import { prisma } from "@/lib/prisma"
import {
  actionError,
  ActionResponse,
  actionSuccess,
} from "@/lib/action-response"
import { serviceSchema, ServiceInput } from "@/lib/validations"
import { ServiceWithCategory } from "@/types/service"
import { getCachedSession } from "../auth-server-hooks"
async function requireAdmin() {
  const session = await getCachedSession()
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
  return session
}

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
