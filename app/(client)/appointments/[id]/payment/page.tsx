"use client"

import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { useEffect, useState, useTransition } from "react"
import { createPaymentIntent } from "@/lib/actions/payments"
import { PaymentForm } from "@/components/client/payment-form"
import { useParams } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { PageLoader } from "@/components/page-loader"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

export default function PaymentPage() {
  const { id } = useParams()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [serviceName, setServiceName] = useState("")
  const [isPending, startTransition] = useTransition()

  if (!id || typeof id !== "string") return <p>ERROR!</p>

  useEffect(() => {
    startTransition(async () => {
      const response = await createPaymentIntent(id)
      if (response.success) {
        setClientSecret(response.data.clientSecret)
        setServiceName(response.data.serviceName)
      }
    })
  }, [id])

  if (isPending) return <PageLoader />
  if (!clientSecret)
    return (
      <div className="flex flex-col gap-2">
        <p>Something went wrong! Try again later.</p>
        <Button
          nativeButton={false}
          className="w-fit"
          render={<Link href="/appointments">Go Back</Link>}
        />
      </div>
    )

  return (
    <div className="mx-auto max-w-md py-12">
      <h1 className="mb-6 text-2xl font-bold">Complete Your Booking</h1>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PaymentForm appointmentId={id} serviceName={serviceName} />
      </Elements>
    </div>
  )
}
