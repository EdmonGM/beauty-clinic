"use server"

import { stripe } from "@/lib/stripe"
import { requireClient } from "@/lib/auth-server-hooks"
import {
  actionError,
  ActionResponse,
  actionSuccess,
} from "@/lib/action-response"
import { prisma } from "@/lib/prisma"

export async function createPaymentIntent(
  appointmentId: string
): Promise<ActionResponse<{ clientSecret: string; serviceName: string }>> {
  try {
    const session = await requireClient()

    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, clientId: session.user.id },
      include: { service: true },
    })

    if (!appointment) {
      return actionError(null, "Appointment not found")
    }

    const amount = Math.round(appointment.service.price * 100)

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: {
        appointmentId,
        clientId: session.user.id,
        serviceName: appointment.service.name,
      },
    })

    if (!paymentIntent.client_secret)
      return actionError(undefined, "Something went wrong!")

    return actionSuccess(
      {
        clientSecret: paymentIntent.client_secret,
        serviceName: appointment.service.name,
      },
      "Payment intent created"
    )
  } catch (error) {
    return actionError(error, "Failed to create payment intent")
  }
}

export async function confirmPayment(
  paymentIntentId: string,
  appointmentId: string
): Promise<ActionResponse<null>> {
  try {
    const session = await requireClient()

    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, clientId: session.user.id },
    })

    if (!appointment) {
      return actionError(null, "Appointment not found")
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== "succeeded") {
      return actionError(null, "Payment not confirmed")
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "CONFIRMED",
        paymentIntentId: paymentIntentId,
      },
    })

    return actionSuccess(null, "Payment confirmed")
  } catch (error) {
    return actionError(error, "Failed to confirm payment")
  }
}
