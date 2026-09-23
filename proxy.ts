import { NextRequest, NextResponse } from "next/server"
import { getCachedSession } from "./lib/auth-server-hooks"

export async function proxy(request: NextRequest) {
  const session = await getCachedSession()

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/not-found", request.url))
  }

  return NextResponse.next()
}
export const config = {
  matcher: ["/admin/:path*"], // Specify the routes the middleware applies to
}
