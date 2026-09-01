import Link from "next/link"
import { UserMenu } from "./auth/user-menu"

export default async function Navbar() {
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
        </nav>
        <UserMenu />
      </div>
    </header>
  )
}
