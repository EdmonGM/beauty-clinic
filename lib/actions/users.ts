"use server"

import { prisma } from "@/lib/prisma"
import { ActionResponse } from "@/types/action-response"
import { requireAdmin } from "@/lib/auth-server-hooks"
import { AdminClientDetail, AdminClientListItem } from "@/types/user"

export async function getAllClients(
  query: string
): Promise<ActionResponse<AdminClientListItem[]>> {
  try {
    await requireAdmin()

    const safeQuery = query.trim().slice(0, 100)

    const where: any = {
      role: "CLIENT",
      ...(safeQuery && {
        OR: [
          { name: { contains: safeQuery, mode: "insensitive" } },
          { email: { contains: safeQuery, mode: "insensitive" } },
          { phone: { contains: safeQuery, mode: "insensitive" } },
        ],
      }),
    }

    const clients = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: { select: { appointments: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    const items: AdminClientListItem[] = clients.map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      createdAt: client.createdAt.toISOString(),
      appointmentCount: client._count.appointments,
    }))

    return { success: true, data: items, message: "Get clients success" }
  } catch (error) {
    return { success: false, error, message: "Get clients error" }
  }
}

export async function getClientById(
  id: string
): Promise<ActionResponse<AdminClientDetail | null>> {
  try {
    await requireAdmin()

    const client = await prisma.user.findFirst({
      where: { id, role: "CLIENT" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        notes: true,
        createdAt: true,
        appointments: {
          select: {
            id: true,
            startsAt: true,
            endsAt: true,
            status: true,
            service: { select: { id: true, name: true } },
          },
          orderBy: { startsAt: "desc" },
        },
        _count: { select: { appointments: true } },
      },
    })

    if (!client) {
      return { success: true, data: null, message: "Client not found" }
    }

    return { success: true, data: client, message: "Get client success" }
  } catch (error) {
    return { success: false, error, message: "Get client error" }
  }
}

export async function updateClientNotes(
  id: string,
  input: string
): Promise<ActionResponse<null>> {
  try {
    await requireAdmin()

    const existing = await prisma.user.findFirst({
      where: { id, role: "CLIENT" },
      select: { id: true },
    })
    if (!existing) {
      return { success: false, error: null, message: "Client not found" }
    }

    const note = input === "" ? null : input

    await prisma.user.update({
      where: { id },
      data: { notes: note },
    })

    return { success: true, data: null, message: "Notes updated" }
  } catch (error) {
    return { success: false, error, message: "Failed to update notes" }
  }
}
