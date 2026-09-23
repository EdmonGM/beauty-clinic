"use server"

import { prisma } from "@/lib/prisma"
import {
  actionError,
  ActionResponse,
  actionSuccess,
} from "@/lib/action-response"
import { requireAdmin } from "@/lib/auth-server-hooks"
import {
  createBlockedSlotSchema,
  CreateBlockedSlotInput,
  UpdateBlockedSlotInput,
} from "@/lib/validations/blocked-slots"
import { BlockedSlot } from "@/generated/prisma"

export async function getBlockedSlots(): Promise<
  ActionResponse<BlockedSlot[]>
> {
  try {
    const blockedSlots = await prisma.blockedSlot.findMany({
      orderBy: { startsAt: "asc" },
    })
    return actionSuccess(blockedSlots, "Get blocked slots success")
  } catch (error) {
    return actionError(error, "Get blocked slots error")
  }
}

export async function getBlockedSlotsForDateRange(
  startDate: Date,
  endDate: Date
): Promise<ActionResponse<BlockedSlot[]>> {
  try {
    const blockedSlots = await prisma.blockedSlot.findMany({
      where: {
        startsAt: { lt: endDate },
        endsAt: { gt: startDate },
      },
      orderBy: { startsAt: "asc" },
    })
    return actionSuccess(
      blockedSlots,
      "Get blocked slots for date range success"
    )
  } catch (error) {
    return actionError(error, "Get blocked slots for date range error")
  }
}

export async function createBlockedSlot(
  input: CreateBlockedSlotInput
): Promise<ActionResponse<string>> {
  try {
    await requireAdmin()
    // const data = createBlockedSlotSchema.parse(input)
    const data = input

    const startsAt = new Date(data.startsAt)
    const endsAt = new Date(data.endsAt)

    const blockedSlot = await prisma.blockedSlot.create({
      data: {
        startsAt,
        endsAt,
        reason: data.reason || null,
      },
    })

    return actionSuccess(blockedSlot.id, "Blocked slot created")
  } catch (error) {
    return actionError(error, "Failed to create blocked slot")
  }
}

export async function updateBlockedSlot(
  id: string,
  input: UpdateBlockedSlotInput
): Promise<ActionResponse<string>> {
  try {
    await requireAdmin()
    const data = createBlockedSlotSchema.parse(input)

    const existing = await prisma.blockedSlot.findFirst({
      where: { id },
    })
    if (!existing) {
      return actionError(null, "Blocked slot not found")
    }

    const startsAt = new Date(data.startsAt)
    const endsAt = new Date(data.endsAt)

    const blockedSlot = await prisma.blockedSlot.update({
      where: { id },
      data: {
        startsAt,
        endsAt,
        reason: data.reason || null,
      },
    })

    return actionSuccess(blockedSlot.id, "Blocked slot updated")
  } catch (error) {
    return actionError(error, "Failed to update blocked slot")
  }
}

export async function deleteBlockedSlot(
  id: string
): Promise<ActionResponse<null>> {
  try {
    await requireAdmin()

    const existing = await prisma.blockedSlot.findFirst({
      where: { id },
    })
    if (!existing) {
      return actionError(null, "Blocked slot not found")
    }

    await prisma.blockedSlot.delete({
      where: { id },
    })

    return actionSuccess(null, "Blocked slot deleted")
  } catch (error) {
    return actionError(error, "Failed to delete blocked slot")
  }
}
