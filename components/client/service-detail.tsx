import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatDuration, formatPrice } from "@/lib/format"
import { ServiceWithCategory } from "@/types/service"
import Link from "next/link"

type ServiceDetailProps = {
  service: ServiceWithCategory
  clinicHours: Array<{ dayOfWeek: string; startTime: string; endTime: string }>
}

export function ServiceDetail({ service, clinicHours }: ServiceDetailProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl">{service.name}</CardTitle>
              <Badge variant="secondary">{service.category.name}</Badge>
            </div>
            <CardDescription>
              {formatPrice(service.price)} ·{" "}
              {formatDuration(service.durationMinutes)}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed">{service.description}</p>
          </CardContent>
        </Card>

        {service.beforeAfterImages.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Before &amp; after</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {service.beforeAfterImages.map((src, index) => (
                  <div
                    key={`${src}-${index}`}
                    className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted"
                  >
                    <Image
                      src={src}
                      alt={`${service.name} result ${index + 1}`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Clinic hours</CardTitle>
          <CardDescription>When the clinic is open</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2">
            {clinicHours.map((slot, index) => (
              <li
                key={index}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <span>
                  {slot.dayOfWeek[0] + slot.dayOfWeek.slice(1).toLowerCase()}
                </span>
                <span className="text-muted-foreground">
                  {slot.startTime} – {slot.endTime}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardContent>
          <Button
            render={<Link href={`/services/${service.id}/book`} />}
            className="w-full"
            nativeButton={false}
          >
            Book Now
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
