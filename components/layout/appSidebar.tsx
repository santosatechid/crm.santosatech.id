"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, LogOut, User as UserIcon } from "lucide-react";

import { useGetUserByIdBetterAuth } from "@/hooks/users/useUsersByIdBetterAuth";
import { iconMap, menuGroups } from "@/config/menuGroupsSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu";
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
import { signOut, useSession } from "@/services/auth/authClients";

const clientName = process.env.NEXT_PUBLIC_CLIENT_NAME || "SaaS Starter";

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending: isSessionPending } = useSession();
  const { data: userData, isLoading: isUserDataLoading } =
    useGetUserByIdBetterAuth(session?.user?.id ?? "");

  if (isSessionPending || isUserDataLoading) {
    return (
      <Sidebar>
        <SidebarHeader className="px-4 py-5">
          <span className="text-[17px] font-semibold tracking-tight">
            {clientName}
          </span>
        </SidebarHeader>
        <SidebarContent className="flex items-center justify-center">
          <p className="text-muted-foreground text-[13px]">Memuat menu...</p>
        </SidebarContent>
      </Sidebar>
    );
  }

  const userRole = userData?.role?.name || "user";
  const permissions = userData?.role?.permissions || [];
  const isAdmin = userRole.toLowerCase().includes("admin");

  const visibleItems = (url: string) =>
    isAdmin || permissions.length === 0 || permissions.includes(url);

  const getUserInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/signIn");
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-sidebar-border border-b px-4 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="bg-primary flex size-7 items-center justify-center rounded-md text-[13px] font-semibold text-white">
            {clientName.slice(0, 1)}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[15px] font-semibold tracking-tight">
              {clientName}
            </span>
            <span className="text-muted-foreground flex items-center gap-1 truncate text-[11px]">
              <Building2 className="size-3 shrink-0" />
              <span className="truncate">CRM</span>
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto px-2 py-3">
        {menuGroups.map((group) => {
          const items = group.items.filter((item) => visibleItems(item.url));
          if (items.length === 0) return null;

          return (
            <SidebarGroup key={group.title} className="mb-3">
              <SidebarGroupLabel className="text-muted-foreground h-7 px-2 text-[11px] font-semibold">
                {group.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {items.map((item) => {
                    const Icon = item.icon ? iconMap[item.icon] : null;
                    const isActive = pathname === item.url;

                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className="h-9 rounded-md px-2 text-[13px]"
                        >
                          <Link href={item.url} className="flex items-center gap-2.5">
                            {Icon && <Icon className="size-4" />}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border border-t p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hover:bg-sidebar-accent flex w-full items-center gap-2.5 rounded-md p-2 text-left transition-colors">
              <Avatar className="size-8 rounded-full">
                {userData?.avatarUrl && (
                  <Image
                    width={32}
                    height={32}
                    src={userData.avatarUrl}
                    alt={userData.name || "User"}
                    className="rounded-full object-cover"
                  />
                )}
                <AvatarFallback className="bg-secondary text-muted-foreground text-[11px] font-semibold">
                  {getUserInitials(userData?.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-foreground truncate text-[13px] font-medium">
                  {userData?.name || "Pengguna"}
                </span>
                <span className="text-muted-foreground truncate text-[11px] capitalize">
                  {userRole}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            side="right"
            className="w-56 rounded-xl p-1"
          >
            <DropdownMenuLabel className="text-muted-foreground px-2 py-1.5 text-[11px]">
              <div>Akun Terhubung</div>
              <div className="text-foreground truncate text-[13px] font-medium">
                {session?.user?.email || "user@example.com"}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => router.push("/dashboard/profile")}
              className="cursor-pointer rounded-md px-2 py-2 text-[13px]"
            >
              <UserIcon className="mr-2 size-4" />
              <span>Profil Pengguna</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive focus:bg-destructive-chip cursor-pointer rounded-md px-2 py-2 text-[13px]"
            >
              <LogOut className="mr-2 size-4" />
              <span>Keluar dari Akun</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
