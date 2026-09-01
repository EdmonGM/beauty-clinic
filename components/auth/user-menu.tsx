"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { useSession } from "@/lib/auth-hooks"
import { signOutAction } from "@/lib/actions/auth"

export function UserMenu() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [signingOut, setSigningOut] = useState(false)

  if (isPending || pathname == "/register" || pathname == "/login") {
    return <div className="h-8 w-20" />
  }

  if (!session) {
    return (
      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/login"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          Log in
        </Link>
        <Link
          href="/register"
          className={buttonVariants({ variant: "default", size: "sm" })}
        >
          Register
        </Link>
      </div>
    )
  }

  async function handleSignOut() {
    setSigningOut(true)
    await signOutAction()
    router.refresh()
    setSigningOut(false)
  }

  return (
    <div className="ml-auto flex items-center gap-3">
      <span className="text-sm text-muted-foreground">
        {session?.user.name}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        disabled={signingOut}
      >
        Sign out
      </Button>
    </div>
  )
}
