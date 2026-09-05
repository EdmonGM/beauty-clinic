import { LayoutDashboardIcon, ScissorsIcon, TagIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { UserMenu } from "../auth/user-menu"
import { getCachedSession } from "@/lib/auth-server-hooks"
import { headers } from "next/headers"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/services", label: "Services", icon: ScissorsIcon },
  { href: "/categories", label: "Categories", icon: TagIcon },
]

export async function AdminSidebar() {
  const session = await getCachedSession()
  const pathname = (await headers()).get("x-pathname")

  return (
    <Sidebar>
      <SidebarHeader className="px-4">Beauty Clinic</SidebarHeader>
      <Separator />
      <SidebarContent className="mt-4 px-4">
        <SidebarMenu className="gap-2">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                className={
                  pathname === "/admin" + item.href
                    ? "rounded-sm bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                    : "rounded-sm"
                }
                render={<a href={"/admin" + item.href} />}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <UserMenu session={session} />
      </SidebarFooter>
    </Sidebar>
  )
}
