"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { serviceSchema, ServiceInput } from "@/lib/validations"
import { createService } from "@/lib/actions/services"
import { Button } from "@/components/ui/button"
import { ServiceForm } from "@/components/admin/service-form"
import { toast } from "sonner"
import Link from "next/link"

type Category = {
  id: string
  name: string
}

type ServiceFormProps = {
  categories: Category[]
}

export function ServiceCreateForm({ categories }: ServiceFormProps) {
  const router = useRouter()
  const form = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 1,
      durationMinutes: 1,
      categoryId: "",
      isActive: true,
    },
  })

  async function onSubmit(data: ServiceInput) {
    const result = await createService(data)

    if (result.success) {
      toast.success("Create service success")
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
        Create Service
      </Button>
      <Button
        variant="outline"
        render={<Link href="/admin/services" />}
        nativeButton={false}
      >
        Cancel
      </Button>
    </>
  )
}
