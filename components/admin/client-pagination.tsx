"use client"

import { Button } from "@/components/ui/button"

type ClientPaginationProps = {
  page: number
  totalPages: number
  total: number
  label: string
  disabled?: boolean
  onPageChangeAction: (page: number) => void
}

export function ClientPagination({
  page,
  totalPages,
  total,
  label,
  disabled = false,
  onPageChangeAction,
}: ClientPaginationProps) {
  const safeTotalPages = Math.max(1, totalPages)

  return (
    <nav
      aria-label={`${label} pagination`}
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <p role="status" className="text-sm text-muted-foreground">
        {total} {label.toLowerCase()} · Page {page} of {safeTotalPages}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={disabled || page <= 1}
          aria-label={`Previous ${label.toLowerCase()} page`}
          onClick={() => onPageChangeAction(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={disabled || page >= safeTotalPages}
          aria-label={`Next ${label.toLowerCase()} page`}
          onClick={() => onPageChangeAction(page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  )
}
