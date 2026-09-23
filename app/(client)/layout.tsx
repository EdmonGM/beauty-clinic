import Navbar from "@/components/navbar"
import { Toaster } from "sonner"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 text-sm text-muted-foreground">
          <span>Beauty Clinic</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
      <Toaster />
    </div>
  )
}
