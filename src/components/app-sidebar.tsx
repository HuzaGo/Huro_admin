"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Bike,
  Store,
  Tags,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "Orders",
    url: "/orders",
    icon: ShoppingBag,
    isActive: false,
  },
  {
    title: "Batches",
    url: "#",
    icon: Layers,
    isActive: false,
  },
  {
    title: "Riders",
    url: "#",
    icon: Bike,
    isActive: false,
  },
  {
    title: "Sellers",
    url: "#",
    icon: Store,
    isActive: false,
  },
  {
    title: "Used Listings",
    url: "#",
    icon: Tags,
    isActive: false,
  },
  {
    title: "Users",
    url: "#",
    icon: Users,
    isActive: false,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-gray-100 bg-white dark:bg-zinc-950">
      <SidebarHeader className="pt-6 pb-4 px-6">
        <div className="flex items-center gap-1 font-bold text-2xl">
          <span className="text-blue-500">huza</span>
          <span className="text-orange-500">Go</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            MAIN MENU
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url || (item.url !== "/" && pathname?.startsWith(item.url));
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      isActive={isActive}
                      render={<Link href={item.url} />}
                      className={`py-5 ${isActive ? 'bg-blue-50 text-blue-600 hover:bg-blue-50 hover:text-blue-600' : 'text-gray-500 hover:text-gray-900'} rounded-lg`}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="font-medium">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 mb-2">
        <div className="flex items-center gap-3 px-2">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="Alex Rivera" />
            <AvatarFallback>AR</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900">Alex Rivera</span>
            <span className="text-xs text-gray-500">Operations Lead</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
