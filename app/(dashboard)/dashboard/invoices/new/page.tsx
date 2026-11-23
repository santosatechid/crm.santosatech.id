import { InvoiceForm } from "@/components/crm/invoiceForm";
import { PageHeader } from "@/components/crm/pageHeader";
import { requireWorkspace } from "@/services/auth/session";
import { prisma } from "@/services/prisma";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  const { workspace } = await requireWorkspace(["OWNER", "ADMIN"]);

  const clients = await prisma.client.findMany({
    where: { workspaceId: workspace.id, archivedAt: null },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buat invoice"
        description={`Nomor otomatis memakai format ${workspace.invoiceNumberFormat}.`}
      />
      {clients.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Tambahkan klien terlebih dahulu sebelum membuat invoice.
        </p>
      ) : (
        <InvoiceForm
          clients={clients}
          defaultTaxRate={Number(workspace.defaultTaxRate)}
          backHref="/dashboard/invoices"
        />
      )}
    </div>
  );
}
