import Link from "next/link"

import { ServiceCard } from "@/components/client/service-card"
import { Button } from "@/components/ui/button"
import { getFeaturedServices } from "@/lib/catalog"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const featured = await getFeaturedServices(4)

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col items-start gap-6 py-10">
        <h1 className="max-w-2xl font-heading text-4xl font-medium tracking-tight sm:text-5xl">
          Feel your best with treatments you can trust.
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Browse our non-surgical beauty treatments, from facials and laser care
          to injectables and body contouring. Booking opens soon.
        </p>
        <div className="flex items-center gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<a href={"/services"} />}
          >
            Browse services
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-medium">Popular treatments</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>
    </div>
  )
}
