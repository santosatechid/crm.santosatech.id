import { notFound } from "next/navigation";

import { InvoiceDocument } from "@/components/crm/invoiceDocument";
import { SignForm } from "@/components/crm/signForm";
import { StatusBadge } from "@/components/crm/statusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDateTime } from "@/lib/format";
import { resolveInvoiceStatus } from "@/lib/invoice";
import { getSignatureByToken } from "@/services/signature";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function SignPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const request = await getSignatureByToken(token);
  if (!request) notFound();

  const active =
    !request.expired &&
    (request.status === "PENDING" || request.status === "VIEWED");
  const signedRequest = request.status === "SIGNED" ? request : null;

  return (
    <main className="bg-background min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold">Tanda tangan invoice</h1>
            <p className="text-muted-foreground text-sm">
              {request.invoice.workspace.name} · {request.invoice.number}
            </p>
          </div>
          <StatusBadge
            kind="signature"
            value={request.expired ? "EXPIRED" : request.status}
          />
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
          signature={signedRequest}
        />

        {active ? (
          <Card>
            <CardHeader>
              <CardTitle>Isi tanda tangan</CardTitle>
            </CardHeader>
            <CardContent>
              <SignForm
                token={token}
                defaultName={request.invoice.client.name}
                defaultEmail={request.invoice.client.email ?? ""}
              />
            </CardContent>
          </Card>
        ) : null}

        {signedRequest ? (
          <Card>
            <CardHeader>
              <CardTitle>Sudah ditandatangani</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>
                Oleh {signedRequest.signerName} pada{" "}
                {formatDateTime(signedRequest.signedAt)}.
              </p>
              <a
                className="font-medium underline underline-offset-4"
                href={`/sign/${token}/print`}
              >
                Lihat / simpan dokumen bertanda tangan
              </a>
            </CardContent>
          </Card>
        ) : null}

        {!active && !signedRequest ? (
          <Card>
            <CardContent className="pt-6 text-sm">
              Link ini tidak dapat dipakai lagi. Status: {request.status}, berlaku
              sampai {formatDate(request.expiresAt)}.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
