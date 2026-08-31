import Link from "next/link"

import { cn } from "@/lib/utils"

type CategoryNavProps = {
  categories: Array<{ id: string; name: string }>
  active?: string
}

export function CategoryNav({ categories, active }: CategoryNavProps) {
  const items = [{ id: "all", name: "All" }, ...categories]
  return (
    <nav aria-label="Filter by category" className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive = item.id === "all" ? !active : item.name === active
        const href =
          item.id === "all"
            ? "/services"
            : `/services?category=${encodeURIComponent(item.name)}`
        return (
          <Link
            key={item.id}
            href={href}
            scroll={false}
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1 text-sm transition-colors",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
