"use server"

import { prisma } from "@/lib/prisma"
import { ActionResponse } from "@/types/action-response"
import { requireAdmin } from "@/lib/auth-server-hooks"
import {
  createAvailabilitySchema,
  CreateAvailabilityInput,
  UpdateAvailabilityInput,
} from "@/lib/validations/availability"
import { Availability } from "@/generated/prisma"

export async function getClinicAvailability(): Promise<
  ActionResponse<Availability[]>
> {
  try {
    const availability = await prisma.availability.findMany({
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    })
    return {
      success: true,
      data: availability,
      message: "Get clinic availability success",
    }
  } catch (error) {
    return { success: false, error, message: "Get clinic availability error" }
  }
}

export async function createAvailability(
  input: CreateAvailabilityInput
): Promise<ActionResponse<string>> {
  try {
    await requireAdmin()
    const data = createAvailabilitySchema.parse(input)

    // Check if this day already has an availability window
    const existing = await prisma.availability.findFirst({
      where: { dayOfWeek: data.dayOfWeek },
    })
    if (existing) {
      return {
        success: false,
        error: null,
        message: `${data.dayOfWeek} already has availability hours set`,
      }
    }

    const availability = await prisma.availability.create({
      data: {
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
      },
    })

    return {
      success: true,
      data: availability.id,
      message: "Availability created",
    }
  } catch (error) {
    return { success: false, error, message: "Failed to create availability" }
  }
}

export async function updateAvailability(
  id: string,
  input: UpdateAvailabilityInput
): Promise<ActionResponse<string>> {
  try {
    await requireAdmin()
    const data = createAvailabilitySchema.parse(input)

    const existing = await prisma.availability.findFirst({
      where: { id },
    })
    if (!existing) {
      return { success: false, error: null, message: "Availability not found" }
    }

    // If changing the day, check if the new day already has hours
    if (existing.dayOfWeek !== data.dayOfWeek) {
      const conflicting = await prisma.availability.findFirst({
        where: { dayOfWeek: data.dayOfWeek },
      })
      if (conflicting) {
        return {
          success: false,
          error: null,
          message: `${data.dayOfWeek} already has availability hours set`,
        }
      }
    }

    const availability = await prisma.availability.update({
      where: { id },
      data: {
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
      },
    })

    return {
      success: true,
      data: availability.id,
      message: "Availability updated",
    }
  } catch (error) {
    return { success: false, error, message: "Failed to update availability" }
  }
}

export async function deleteAvailability(
  id: string
): Promise<ActionResponse<null>> {
  try {
    await requireAdmin()

    const existing = await prisma.availability.findFirst({
      where: { id },
    })
    if (!existing) {
      return { success: false, error: null, message: "Availability not found" }
    }

    await prisma.availability.delete({
      where: { id },
    })

    return { success: true, data: null, message: "Availability deleted" }
  } catch (error) {
    return { success: false, error, message: "Failed to delete availability" }
  }
}
