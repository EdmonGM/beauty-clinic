import { Category, Service } from "@/generated/prisma"

export type ServiceWithCategory = Service & { category: Category }
