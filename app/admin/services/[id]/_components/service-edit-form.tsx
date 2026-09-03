"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { serviceSchema, ServiceInput } from "@/lib/validations"
import { updateService } from "@/lib/actions/services"
import { Button } from "@/components/ui/button"
import { ServiceWithCategory } from "@/types/service"
import { ServiceForm } from "@/components/admin/service-form"
import { toast } from "sonner"

type Category = {
  id: string
  name: string
}

type ServiceFormProps = {
  categories: Category[]
  service: ServiceWithCategory
}

export function ServiceEditForm({ categories, service }: ServiceFormProps) {
  const router = useRouter()
  const form = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service.name,
      description: service.description || "",
      price: service.price,
      durationMinutes: service.durationMinutes,
      categoryId: service.categoryId,
      isActive: service.isActive,
    },
  })

  async function onSubmit(data: ServiceInput) {
    const result = await updateService(service!.id, data)

    if (result.success) {
      toast.success("Edit success")
      router.push("/admin/services")
    }
  }

  return (
    <>
      <ServiceForm
        form={form}
        categories={categories}
        onSubmitAction={onSubmit}
      />
      <Button type="submit" form="service-form">
        Save Changes
      </Button>
      <Button variant="outline" render={<a href="/admin/services" />}>
        Cancel
      </Button>
    </>
  )
}
