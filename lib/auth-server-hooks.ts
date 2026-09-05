import { cache } from "react"
import { auth } from "./auth"
import { headers } from "next/headers"

export const getCachedSession = cache(async () => {
  return await auth.api.getSession({
    headers: await headers(),
  })
})

export async function requireAdmin() {
  const session = await getCachedSession()
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
  return true
}
