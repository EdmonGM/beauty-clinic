"use server"

import { confirmPayment } from "@/lib/actions/payments"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { stripe } from "@/lib/stripe"

export default async function PaymentSuccessPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { payment_intent: string }
}) {
  const { payment_intent: paymentIntentId } = await searchParams
  const { id } = await params

  if (paymentIntentId) {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status === "succeeded") {
      await confirmPayment(paymentIntentId, id)
    }
  }

  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <h1 className="mb-4 text-2xl font-bold">✓ Payment Successful</h1>
      <p className="mb-6 text-gray-600">Your appointment is confirmed.</p>
      <Link href="/appointments">
        <Button>View Your Appointments</Button>
      </Link>
    </div>
  )
}
