import { Category, Service } from "@/generated/prisma"

export type CategoryWithServices = Category & { services: Service[] }
