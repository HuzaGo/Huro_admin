"use client";

import { useState, useEffect } from "react";
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
  FolderTree,
  LogOut
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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser, logout } from "@/store/slices/authSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

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
    title: "Categories",
    url: "/categories",
    icon: FolderTree,
    isActive: false,
  },
  {
    title: "Products",
    url: "/products",
    icon: ShoppingBag, // You can change this icon if you prefer, imported above
    isActive: false,
  },
  {
    title: "Batches",
    url: "/batches",
    icon: Layers,
  },
  {
    title: "Riders",
    url: "/riders",
    icon: Bike,
    isActive: false,
  },
  {
    title: "Sellers",
    url: "/sellers",
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
    url: "/users",
    icon: Users,
    isActive: false,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    // Try to logout from server, but also force local logout via reducer
    dispatch(logoutUser());
    dispatch(logout());
    
    // Redirect to login page
    window.location.href = '/login';
  };

  // Safe user formatting
  const userName = isMounted && user ? (user.fullName || user.name || user.username || "Admin User") : "Admin User";
  const userRole = isMounted && user ? (user.role || user.Role || "Administrator") : "Administrator";
  const userInitials = userName.substring(0, 2).toUpperCase();

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
        <div className="flex items-center justify-between gap-2 px-2">
          <div className="flex items-center gap-3">
            <Avatar>
              {user?.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={userName} />
              ) : null}
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">{userName}</span>
              <span className="text-xs text-gray-500">{userRole}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-500 hover:text-red-500">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
