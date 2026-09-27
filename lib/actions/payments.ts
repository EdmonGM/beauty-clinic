"use server"

import { stripe } from "@/lib/stripe"
import { requireClient } from "@/lib/auth-server-hooks"
import { ActionResponse } from "@/types/action-response"
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
      return { success: false, error: null, message: "Appointment not found" }
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
      return {
        success: false,
        error: undefined,
        message: "Something went wrong!",
      }

    return {
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        serviceName: appointment.service.name,
      },
      message: "Payment intent created",
    }
  } catch (error) {
    return { success: false, error, message: "Failed to create payment intent" }
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
      return { success: false, error: null, message: "Appointment not found" }
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== "succeeded") {
      return { success: false, error: null, message: "Payment not confirmed" }
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "CONFIRMED",
        paymentIntentId: paymentIntentId,
      },
    })

    return { success: true, data: null, message: "Payment confirmed" }
  } catch (error) {
    return { success: false, error, message: "Failed to confirm payment" }
  }
}
