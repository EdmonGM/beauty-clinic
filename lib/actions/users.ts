"use server"

import { prisma } from "@/lib/prisma"
import {
  actionError,
  ActionResponse,
  actionSuccess,
} from "@/lib/action-response"
import { requireAdmin } from "@/lib/auth-server-hooks"
import {
  clientIdSchema,
  clientNotesSchema,
  ClientNotesInput,
} from "@/lib/validations/users"
import {
  AdminClientDetail,
  AdminClientListItem,
  ClientPage,
} from "@/types/user"

const PAGE_SIZE = 20

function buildPage<T>(items: T[], total: number, page: number): ClientPage<T> {
  return {
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  }
}

export async function getAllClients(
  query: string,
  page: number
): Promise<ActionResponse<ClientPage<AdminClientListItem>>> {
  try {
    await requireAdmin()

    const safeQuery = query.trim().slice(0, 100)
    const safePage = Math.max(1, Math.floor(page) || 1)

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

    const [clients, total] = await Promise.all([
      prisma.user.findMany({
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
        skip: (safePage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.user.count({ where }),
    ])

    const items: AdminClientListItem[] = clients.map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      createdAt: client.createdAt.toISOString(),
      appointmentCount: client._count.appointments,
    }))

    return actionSuccess(
      buildPage(items, total, safePage),
      "Get clients success"
    )
  } catch (error) {
    return actionError(error, "Get clients error")
  }
}

export async function getClientById(
  id: string
): Promise<ActionResponse<AdminClientDetail | null>> {
  try {
    await requireAdmin()

    const clientId = clientIdSchema.parse(id)

    const client = await prisma.user.findFirst({
      where: { id: clientId, role: "CLIENT" },
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
      return actionSuccess(null, "Client not found")
    }

    return actionSuccess(client, "Get client success")
  } catch (error) {
    return actionError(error, "Get client error")
  }
}

export async function updateClientNotes(
  id: string,
  input: ClientNotesInput
): Promise<ActionResponse<null>> {
  try {
    await requireAdmin()

    const clientId = clientIdSchema.parse(id)
    const data = clientNotesSchema.parse(input)

    const existing = await prisma.user.findFirst({
      where: { id: clientId, role: "CLIENT" },
      select: { id: true },
    })
    if (!existing) {
      return actionError(null, "Client not found")
    }

    await prisma.user.update({
      where: { id: clientId },
      data: { notes: data.notes || null },
    })

    return actionSuccess(null, "Notes updated")
  } catch (error) {
    return actionError(error, "Failed to update notes")
  }
}
