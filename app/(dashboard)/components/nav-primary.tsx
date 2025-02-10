import Link from "next/link";
import { Home, Users, Logs, Cog } from "lucide-react";

import { getUserAction } from "@/app/(dashboard)/actions/users";

import {
  SidebarMenuItem,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
    access: ["employee", "manager", "admin"],
  },
  {
    title: "Team",
    url: "/dashboard/team",
    icon: Users,
    access: ["manager", "admin"],
  },
  {
    title: "Logs",
    url: "/dashboard/logs",
    icon: Logs,
    access: ["employee", "manager", "admin"],
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Cog,
    access: ["admin"],
  },
];

export async function SidebarNavPrimary() {
  const user = await getUserAction();

  if (!user || !user.role) return <h1>Unauthorized</h1>;

  return (
    <SidebarMenu>
      {items
        .filter((item) => item.access.includes(user.role!))
        .map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <Link href={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
    </SidebarMenu>
  );
}
