import DashboardShell from "@/components/layout/dashboardShell";
import { requireWorkspace } from "@/services/auth/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, workspace, membership } = await requireWorkspace();

  return (
    <DashboardShell
      userName={user.name}
      workspaceName={workspace.name}
      role={membership.role}
    >
      {children}
    </DashboardShell>
  );
}
