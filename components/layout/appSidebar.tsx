"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";

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
import { signOut } from "@/services/auth/authClients";
import { ROLE_LABEL } from "@/lib/permissions";

type AppSidebarProps = {
  userName: string;
  workspaceName: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
};

export function AppSidebar({ userName, workspaceName, role }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const groups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/signIn");
  };

  return (
    <Sidebar className="border-border bg-sidebar text-foreground border-r">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold">
            {workspaceName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{workspaceName}</p>
            <p className="text-muted-foreground truncate text-xs">
              {ROLE_LABEL[role] ?? role}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon ? iconMap[item.icon] : undefined;
                  const active =
                    pathname === item.url ||
                    (item.url !== "/dashboard" && pathname.startsWith(`${item.url}/`));
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link href={item.url}>
                          {Icon ? <Icon /> : null}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hover:bg-sidebar-accent flex w-full items-center gap-3 rounded-md px-2 py-2 text-left">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{initials || "?"}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{userName}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {ROLE_LABEL[role] ?? role}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuLabel>Akun</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <UserIcon className="mr-2 h-4 w-4" /> Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
