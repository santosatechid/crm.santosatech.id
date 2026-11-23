"use client";

import { type ReactNode } from "react";

import { AppSidebar } from "@/components/layout/appSidebar";
import Footer from "@/components/layout/footer";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type DashboardShellProps = {
  children: ReactNode;
  userName: string;
  workspaceName: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
};

export default function DashboardShell({
  children,
  userName,
  workspaceName,
  role,
}: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar userName={userName} workspaceName={workspaceName} role={role} />
      <SidebarInset className="bg-background flex min-h-screen flex-col">
        <header className="bg-background/95 supports-backdrop-filter:bg-background/60 border-border sticky flex shrink-0 items-center gap-2 border-b px-4 py-4 backdrop-blur md:px-6">
          <SidebarTrigger />
        </header>
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">{children}</div>
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
