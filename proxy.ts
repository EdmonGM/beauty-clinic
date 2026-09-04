import { NextRequest, NextResponse } from "next/server"
import { getCachedSession } from "./lib/auth-server-hooks"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await getCachedSession()

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (pathname.startsWith("/admin")) {
    if (session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }
  const response = NextResponse.next()
  response.headers.set("x-pathname", pathname)
  return response
}
export const config = {
  matcher: ["/admin/:path*"], // Specify the routes the middleware applies to
}
