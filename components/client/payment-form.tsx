"use client"

import { useState } from "react"
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"

interface PaymentFormProps {
  appointmentId: string
  serviceName: string
}

export function PaymentForm({ appointmentId, serviceName }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/appointments/${appointmentId}/payment-success`,
        },
      })

      if (result.error) {
        setError(result.error.message || "Payment failed")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="rounded-lg border p-4">
        <h3 className="mb-4 font-semibold">Pay for {serviceName}</h3>
        <PaymentElement />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        type="submit"
        disabled={!stripe || !elements || loading}
        className="w-full"
      >
        {loading ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  )
}
