import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatDuration, formatPrice } from "@/lib/format"

type ServiceCardProps = {
  service: {
    id: string
    name: string
    description: string | null
    price: { toNumber(): number }
    durationMinutes: number
    category: { name: string }
  }
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link
      href={`/services/${service.id}`}
      className="group flex h-full rounded-2xl focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
    >
      <Card
        size="sm"
        className="h-full w-full transition-shadow group-hover:shadow-md"
      >
        <CardHeader>
          <CardTitle>{service.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3">
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {service.description}
          </p>
          <div className="mt-auto flex items-center gap-2">
            <span className="font-medium">{formatPrice(service.price)}</span>
            <span className="text-sm text-muted-foreground">
              {formatDuration(service.durationMinutes)}
            </span>
          </div>
        </CardContent>
        <CardFooter>
          <Badge variant="secondary">{service.category.name}</Badge>
        </CardFooter>
      </Card>
    </Link>
  )
}
