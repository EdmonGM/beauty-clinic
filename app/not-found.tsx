import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-start gap-3 px-4 py-8">
        <h1 className="font-heading text-2xl font-medium tracking-tight">
          Page not found
        </h1>
        <p className="text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button render={<Link href="/" />} nativeButton={false}>
          Back to home page
        </Button>
      </div>
      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 text-sm text-muted-foreground">
          <span>Beauty Clinic</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}
