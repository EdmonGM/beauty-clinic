import { CategoryNav } from "@/components/client/category-nav"
import { ServiceCard } from "@/components/client/service-card"
import { getAllCategories } from "@/lib/actions/categories"
import { getActiveServices } from "@/lib/actions/services"

type ServicesPageProps = {
  searchParams: Promise<{ category?: string | string[] }>
}

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  const { category } = await searchParams
  const categoryName = typeof category === "string" ? category : undefined

  const [categories, services] = await Promise.all([
    getAllCategories(),
    getActiveServices(categoryName),
  ])

  if (!services.success || !services.data || !categories.success) return

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-2xl font-medium tracking-tight">
          Treatments
        </h1>
        <CategoryNav categories={categories.data} active={categoryName} />
      </div>

      {services.data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.data.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No services in this category yet. Check back soon.
        </p>
      )}
    </div>
  )
}
