import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ServiceDetail } from "@/components/client/service-detail"
import { getClinicHours, getServiceById } from "@/lib/catalog"

type ServicePageProps = {
  params: Promise<{ id: string }>
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { id } = await params

  const [service, clinicHours] = await Promise.all([
    getServiceById(id),
    getClinicHours(),
  ])
  if (!service) notFound()

  return <ServiceDetail service={service} clinicHours={clinicHours} />
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { id } = await params
  const service = await getServiceById(id)
  if (!service) return { title: "Service not found" }
  return { title: service.name }
}
