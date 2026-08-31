"use server"

import { prisma } from "./prisma"
import type { Availability, Category, Service } from "../generated/prisma/index"

export type ServiceWithCategory = Service & { category: Category }

export async function getCategories(): Promise<Category[]> {
  return await prisma.category.findMany({ orderBy: { name: "asc" } })
}

export async function getActiveServices(
  categoryName?: string
): Promise<ServiceWithCategory[]> {
  return await prisma.service.findMany({
    where: {
      isActive: true,
      ...(categoryName ? { category: { name: categoryName } } : {}),
    },
    include: { category: true },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  })
}

export async function getFeaturedServices(
  limit = 4
): Promise<ServiceWithCategory[]> {
  return await prisma.service.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    take: limit,
  })
}

export async function getServiceById(
  id: string
): Promise<ServiceWithCategory | null> {
  return await prisma.service.findFirst({
    where: { id, isActive: true },
    include: { category: true },
  })
}

export async function getClinicHours(): Promise<Availability[]> {
  return await prisma.availability.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  })
}
