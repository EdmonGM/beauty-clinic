import { ServiceCard } from "@/components/client/service-card"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { getFeaturedServices } from "@/lib/actions/services"
import Image from "next/image"
import Link from "next/link"

export default async function HomePage() {
  const featured = await getFeaturedServices(4)

  if (!featured.success || !featured.data) return

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />

      <main>
        <section className="relative flex flex-col items-start gap-6 px-4 py-40 md:px-24">
          <Image
            alt="background"
            src="/bg-3.jpg"
            fill
            priority
            className="-z-50 object-cover"
          />
          <h1 className="max-w-2xl font-heading text-4xl font-medium tracking-tight sm:text-5xl">
            Feel your best with treatments you can trust.
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Browse our non-surgical beauty treatments, from facials and laser
            care to injectables and body contouring. Booking opens soon.
          </p>
          <div className="flex items-center gap-3">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href={"/services"} />}
            >
              Browse services
            </Button>
          </div>
        </section>
        <section className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          <h2 className="my-2 font-heading text-lg font-medium">
            Popular treatments
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.data.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 text-sm text-muted-foreground">
          <span>Beauty Clinic</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}
