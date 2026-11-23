import { ClientsView } from "@/components/crm/clientsView";
import { PageHeader } from "@/components/crm/pageHeader";
import { requireWorkspace } from "@/services/auth/session";
import { prisma } from "@/services/prisma";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const { workspace, membership } = await requireWorkspace();

  const clients = await prisma.client.findMany({
    where: { workspaceId: workspace.id, archivedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      _count: { select: { contacts: true, invoices: true, tasks: true } },
    },
  });

  const canManage = membership.role === "OWNER" || membership.role === "ADMIN";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Klien"
        description="Data klien, kontak PIC, dan riwayat interaksi."
      />
      <ClientsView clients={clients} canManage={canManage} />
    </div>
  );
}
