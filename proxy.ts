import { NextRequest, NextResponse } from "next/server"
import { auth } from "./lib/auth"
import { headers } from "next/headers"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  if (pathname.startsWith("/admin")) {
    if (session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unaithorized", request.url))
    }
  }
  return NextResponse.next()
}
export const config = {
  matcher: ["/"], // Specify the routes the middleware applies to
}
