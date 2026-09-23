"use server"

import Link from "next/link"
import { UserMenu } from "./auth/user-menu"
import { getCachedSession } from "@/lib/auth-server-hooks"

export default async function Navbar() {
  const session = await getCachedSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4">
        <Link
          href="/"
          className="font-heading text-sm font-medium tracking-tight"
        >
          Glow Clinic
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/services"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Services
          </Link>
          {session && session.user.role === "CLIENT" && (
            <Link
              href="/appointments"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              My Appointments
            </Link>
          )}
          {session && session.user.role === "ADMIN" && (
            <Link
              href="/admin/dashboard"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
          )}
        </nav>
        <UserMenu session={session} />
      </div>
    </header>
  )
}
