"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import {
  actionError,
  ActionResponse,
  actionSuccess,
} from "@/lib/action-response"

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
}: {
  name: string
  email: string
  password: string
}): Promise<ActionResponse<any>> {
  try {
    const { user } = await auth.api.signUpEmail({
      body: { name, email, password },
      headers: await headers(),
    })
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
