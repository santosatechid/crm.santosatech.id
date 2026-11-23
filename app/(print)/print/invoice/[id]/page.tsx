import Link from "next/link";
import { notFound } from "next/navigation";

import { InvoiceDocument } from "@/components/crm/invoiceDocument";
import { PrintButton } from "@/components/crm/printButton";
import { formatIDR } from "@/lib/format";
import { resolveInvoiceStatus } from "@/lib/invoice";
import { requireWorkspace } from "@/services/auth/session";
import { prisma } from "@/services/prisma";

export const dynamic = "force-dynamic";

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { workspace } = await requireWorkspace(["OWNER", "ADMIN"]);

  const invoice = await prisma.invoice.findFirst({
    where: { id, workspaceId: workspace.id },
    include: {
      client: true,
      items: { orderBy: { sortOrder: "asc" } },
      signatureRequests: {
        where: { status: "SIGNED" },
        orderBy: { signedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!invoice) notFound();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div>
          <p className="text-sm font-medium">Invoice {invoice.number}</p>
          <p className="text-muted-foreground text-xs">
            {formatIDR(invoice.total)} · gunakan Cetak lalu pilih Simpan sebagai PDF.
          </p>
        </div>
        <div className="flex gap-2">
          <PrintButton />
          <Link
            href={`/dashboard/invoices/${invoice.id}`}
            className="text-sm underline-offset-4 hover:underline"
          >
            Kembali
          </Link>
        </div>
      </div>

      <InvoiceDocument
        workspace={workspace}
        client={invoice.client}
        invoice={{
          number: invoice.number,
          status: resolveInvoiceStatus(invoice.status, invoice.dueDate),
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          subtotal: invoice.subtotal,
          discount: invoice.discount,
          taxRate: String(invoice.taxRate),
          taxAmount: invoice.taxAmount,
          total: invoice.total,
          note: invoice.note,
        }}
        items={invoice.items.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: String(item.quantity),
          unitPrice: item.unitPrice,
          amount: item.amount,
        }))}
        signature={invoice.signatureRequests[0] ?? null}
      />
    </div>
  );
}
