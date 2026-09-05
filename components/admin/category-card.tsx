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
import { MoreVerticalIcon, PencilIcon, TrashIcon } from "lucide-react"
import { CategoryWithServices } from "@/types/category"

type AdminCategoryCardProps = {
  category: CategoryWithServices
  onDeleteAction: (id: string, name: string) => void
}

export function AdminCategoryCard({
  category,
  onDeleteAction,
}: AdminCategoryCardProps) {
  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate">{category.name}</CardTitle>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" />}
          >
            <MoreVerticalIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              render={<a href={`/admin/categories/${category.id}/edit`} />}
            >
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDeleteAction(category.id, category.name)}
            >
              <TrashIcon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {category.description || "No description"}
        </p>
      </CardContent>
      <CardFooter className="flex items-center gap-2">
        <Badge variant="secondary">
          {category.services.length}{" "}
          {category.services.length === 1 ? "service" : "services"}
        </Badge>
      </CardFooter>
    </Card>
  )
}
