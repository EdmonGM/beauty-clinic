import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { BookingWidget } from "@/components/client/booking-widget"
import { getServiceById } from "@/lib/actions/services"

type BookPageProps = {
  params: Promise<{ id: string }>
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params
  const result = await getServiceById(id)

  if (!result || !result.success || !result.data) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          render={<a href={`/services/${id}`} />}
          className="gap-1.5"
        >
          ← Back to service
        </Button>
      </div>
      <BookingWidget
        service={{
          id: result.data.id,
          name: result.data.name,
          price: result.data.price,
          durationMinutes: result.data.durationMinutes,
          category: { name: result.data.category.name },
        }}
      />
    </div>
  )
}

export async function generateMetadata({
  params,
}: BookPageProps): Promise<Metadata> {
  const { id } = await params
  const result = await getServiceById(id)
  if (!result || !result.success || !result.data)
    return { title: "Service not found" }
  return { title: `Book ${result.data.name}` }
}
