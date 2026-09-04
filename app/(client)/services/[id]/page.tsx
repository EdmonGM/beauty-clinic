import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ServiceDetail } from "@/components/client/service-detail"
import { getClinicHours } from "@/lib/catalog"
import { getServiceById } from "@/lib/actions/services"

type ServicePageProps = {
  params: Promise<{ id: string }>
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { id } = await params

  const [service, clinicHours] = await Promise.all([
    getServiceById(id),
    getClinicHours(),
  ])
  if (!service || !service.success || !service.data) {
    notFound()
  }

  return <ServiceDetail service={service.data} clinicHours={clinicHours} />
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { id } = await params
  const service = await getServiceById(id)
  if (!service || !service.success || !service.data)
    return { title: "Service not found" }
  return { title: service.data.name }
}
