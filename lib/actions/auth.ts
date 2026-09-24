"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import {
  actionError,
  ActionResponse,
  actionSuccess,
} from "@/lib/action-response"
import { prisma } from "../prisma"

type LoginResponse = {
  username: string
  token: string
}

export async function signInAction({
  email,
  password,
}: {
  email: string
  password: string
}): Promise<ActionResponse<LoginResponse>> {
  try {
    const { user, token } = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    })
    return actionSuccess({ username: user.name, token }, "Log in success")
  } catch (error) {
    return actionError(error, "Incorrect email or password")
  }
}

export async function signUpAction({
  name,
  email,
  password,
  phone,
}: {
  name: string
  email: string
  password: string
  phone?: string
}): Promise<ActionResponse<any>> {
  try {
    const { user } = await auth.api.signUpEmail({
      body: { name, email, password },
      headers: await headers(),
    })
    if (phone && phone !== "") {
      await prisma.user.update({
        where: { id: user.id },
        data: { phone },
      })
    }
    return actionSuccess(user, "Singup success")
  } catch (error) {
    return actionError(error, "Signup failed")
  }
}

export async function signOutAction(): Promise<ActionResponse<any>> {
  try {
    await auth.api.signOut({
      headers: await headers(),
    })
    return actionSuccess(null, "Signout success")
  } catch (error) {
    return actionError(error, "Signout failed")
  }
}
