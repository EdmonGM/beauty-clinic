"use client"

import { usePathname } from "next/navigation"
import { LayoutDashboardIcon, ScissorsIcon } from "lucide-react"
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

const navItems = [
  { href: "dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "services", label: "Services", icon: ScissorsIcon },
]

export function AdminSidebar() {
  const pathname = usePathname()

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
                  pathname.startsWith("/admin/" + item.href)
                    ? "rounded-sm bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                    : "rounded-sm"
                }
                render={<a href={item.href} />}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
