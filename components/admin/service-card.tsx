"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDuration, formatPrice } from "@/lib/format"
import {
  MoreVerticalIcon,
  PencilIcon,
  PowerIcon,
  TrashIcon,
} from "lucide-react"
import { toggleServiceActive } from "@/lib/actions/services"
import { ServiceWithCategory } from "@/types/service"

type AdminServiceCardProps = {
  service: ServiceWithCategory
  onDeleteAction: (id: string, name: string) => void
}

export function AdminServiceCard({
  service,
  onDeleteAction,
}: AdminServiceCardProps) {
  async function handleServiceToggle() {
    await toggleServiceActive(service.id)
    window.location.reload()
  }

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate">{service.name}</CardTitle>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" />}
          >
            <MoreVerticalIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              render={<a href={`/admin/services/${service.id}/edit`} />}
            >
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleServiceToggle}>
              <PowerIcon />
              {service.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDeleteAction(service.id, service.name)}
            >
              <TrashIcon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {service.description || "No description"}
        </p>
        <div className="flex items-center gap-2">
          <span className="font-medium">{formatPrice(service.price)}</span>
          <span className="text-sm text-muted-foreground">
            {formatDuration(service.durationMinutes)}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center gap-2">
        <Badge variant="secondary">{service.category.name}</Badge>
        <Badge variant={service.isActive ? "default" : "outline"}>
          {service.isActive ? "Active" : "Inactive"}
        </Badge>
      </CardFooter>
    </Card>
  )
}
