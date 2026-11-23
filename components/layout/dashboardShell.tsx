"use client";

import { type ReactNode } from "react";

import { GlassBackground } from "@/components/glass/background";
import { AppSidebar } from "@/components/layout/appSidebar";
import Footer from "@/components/layout/footer";
import InstallButton from "@/components/layout/installButton";
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
      <GlassBackground />
      <AppSidebar userName={userName} workspaceName={workspaceName} role={role} />
      <SidebarInset className="flex min-h-screen flex-col bg-transparent">
        <header className="sticky flex shrink-0 items-center gap-2 border-b border-white/10 bg-black/30 px-4 py-3 backdrop-blur-xl backdrop-saturate-150 md:px-6">
          <SidebarTrigger />
        </header>
        <main className="flex-1 overflow-auto">
          <div className="mx-auto space-y-6 p-4 md:p-6 lg:p-8">{children}</div>
        </main>
        <Footer />
        <InstallButton />
      </SidebarInset>
    </SidebarProvider>
  );
}
