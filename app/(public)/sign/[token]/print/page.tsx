import Link from "next/link";
import { notFound } from "next/navigation";

import { InvoiceDocument } from "@/components/crm/invoiceDocument";
import { PrintButton } from "@/components/crm/printButton";
import { resolveInvoiceStatus } from "@/lib/invoice";
import { getSignatureByToken } from "@/services/signature";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function SignedInvoicePrintPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const request = await getSignatureByToken(token);
  if (!request || request.status !== "SIGNED") notFound();

  return (
    <main className="bg-background min-h-screen px-4 py-8 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center justify-between gap-2 print:hidden">
          <p className="text-sm font-medium">
            Dokumen bertanda tangan · {request.invoice.number}
          </p>
          <div className="flex gap-2">
            <PrintButton />
            <Link
              href={`/sign/${token}`}
              className="text-sm underline-offset-4 hover:underline"
            >
              Kembali
            </Link>
          </div>
        </div>
        <InvoiceDocument
          workspace={request.invoice.workspace}
          client={request.invoice.client}
          invoice={{
            number: request.invoice.number,
            status: resolveInvoiceStatus(
              request.invoice.status,
              request.invoice.dueDate,
            ),
            issueDate: request.invoice.issueDate,
            dueDate: request.invoice.dueDate,
            subtotal: request.invoice.subtotal,
            discount: request.invoice.discount,
            taxRate: String(request.invoice.taxRate),
            taxAmount: request.invoice.taxAmount,
            total: request.invoice.total,
            note: request.invoice.note,
          }}
          items={request.invoice.items.map((item) => ({
            id: item.id,
            description: item.description,
            quantity: String(item.quantity),
            unitPrice: item.unitPrice,
            amount: item.amount,
          }))}
          signature={request}
        />
      </div>
    </main>
  );
}
