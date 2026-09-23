import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { getCachedSession } from "@/lib/auth-server-hooks"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getCachedSession()
  return (
    <SidebarProvider>
      <AdminSidebar session={session} />
      <main className="w-full p-6">{children}</main>
      <Toaster />
    </SidebarProvider>
  )
}
