"use client"

import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { useEffect, useState } from "react"
import { createPaymentIntent } from "@/lib/actions/payments"
import { PaymentForm } from "@/components/client/payment-form"
import { useParams } from "next/navigation"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

export default function PaymentPage() {
  const { id } = useParams()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  if (!id || typeof id !== "string") return <p>ERROR!</p>

  useEffect(() => {
    const initPayment = async () => {
      const response = await createPaymentIntent(id) // amount in cents
      if (response.success) {
        setClientSecret(response.data.clientSecret)
      }
      setLoading(false)
    }
    initPayment()
  }, [id])

  if (loading) return <div>Loading...</div>
  if (!clientSecret) return <div>Failed to initialize payment</div>

  return (
    <div className="mx-auto max-w-md py-12">
      <h1 className="mb-6 text-2xl font-bold">Complete Your Booking</h1>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PaymentForm appointmentId={id} serviceName="Facial" />
      </Elements>
    </div>
  )
}
