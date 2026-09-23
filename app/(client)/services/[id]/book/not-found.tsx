import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function BookNotFound() {
  return (
    <div className="flex max-w-md flex-col items-start gap-3 py-10">
      <h1 className="font-heading text-2xl font-medium tracking-tight">
        Service not found
      </h1>
      <p className="text-sm text-muted-foreground">
        The treatment you&apos;re trying to book doesn&apos;t exist or is no
        longer available.
      </p>
      <Button render={<Link href="/services" />}>Back to services</Button>
    </div>
  )
}
