import { PageHeader } from "@/components/crm/pageHeader";
import { TeamManager } from "@/components/crm/teamManager";
import { WorkspaceSettingsForm } from "@/components/crm/workspaceSettingsForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireWorkspace } from "@/services/auth/session";
import { prisma } from "@/services/prisma";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { workspace, user, membership } = await requireWorkspace(["OWNER", "ADMIN"]);

  const [memberships, invites] = await Promise.all([
    prisma.membership.findMany({
      where: { workspaceId: workspace.id },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.workspaceInvite.findMany({
      where: {
        workspaceId: workspace.id,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspace & Tim"
        description="Profil kantor yang tampil di invoice, nomor invoice, pajak default, dan anggota tim."
      />

      <Card>
        <CardHeader>
          <CardTitle>Profil kantor</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkspaceSettingsForm
            initial={{
              name: workspace.name,
              email: workspace.email ?? "",
              phone: workspace.phone ?? "",
              address: workspace.address ?? "",
              logoUrl: workspace.logoUrl ?? "",
              bankName: workspace.bankName ?? "",
              bankAccountNumber: workspace.bankAccountNumber ?? "",
              bankAccountName: workspace.bankAccountName ?? "",
              invoiceNumberFormat: workspace.invoiceNumberFormat,
              defaultTaxRate: String(workspace.defaultTaxRate),
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Anggota tim</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamManager
            currentRole={membership.role}
            currentUserId={user.id}
            members={memberships.map((member) => ({
              membershipId: member.id,
              userId: member.user.id,
              name: member.user.name,
              email: member.user.email,
              role: member.role,
            }))}
            invites={invites.map((invite) => ({
              id: invite.id,
              email: invite.email,
              role: invite.role,
              expiresAt: invite.expiresAt,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
