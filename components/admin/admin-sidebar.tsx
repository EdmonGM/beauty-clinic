import {
  CalendarClockIcon,
  CalendarDaysIcon,
  LayoutDashboardIcon,
  ScissorsIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react"
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
import Link from "next/link"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/appointments", label: "Appointments", icon: CalendarDaysIcon },
  { href: "/availability", label: "Availability", icon: CalendarClockIcon },
  { href: "/services", label: "Services", icon: ScissorsIcon },
  { href: "/categories", label: "Categories", icon: TagIcon },
  { href: "/users", label: "Users", icon: UsersIcon },
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
                render={<Link href={"/admin" + item.href} />}
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
