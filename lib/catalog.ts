"use server"

import { prisma } from "./prisma"
import type { Availability, Category, Service } from "../generated/prisma/index"

export type ServiceWithCategory = Service & { category: Category }

export async function getCategories(): Promise<Category[]> {
  return await prisma.category.findMany({ orderBy: { name: "asc" } })
}

export async function getClinicHours(): Promise<Availability[]> {
  return await prisma.availability.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  })
}
