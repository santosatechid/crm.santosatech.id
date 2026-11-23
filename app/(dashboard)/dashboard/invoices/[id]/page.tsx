import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";

import { InvoiceActions } from "@/components/crm/invoiceActions";
import { InvoiceDocument } from "@/components/crm/invoiceDocument";
import { InvoiceForm } from "@/components/crm/invoiceForm";
import { PageHeader } from "@/components/crm/pageHeader";
import { PrintButton } from "@/components/crm/printButton";
import { StatusBadge } from "@/components/crm/statusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatDateTime, formatIDR } from "@/lib/format";
import { resolveInvoiceStatus } from "@/lib/invoice";
import { requireWorkspace } from "@/services/auth/session";
import { prisma } from "@/services/prisma";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
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
      task: { select: { id: true, title: true } },
      items: { orderBy: { sortOrder: "asc" } },
      payments: {
        include: { recordedBy: { select: { name: true } } },
        orderBy: { paidAt: "desc" },
      },
      signatureRequests: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!invoice) notFound();

  const paid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const displayStatus = resolveInvoiceStatus(invoice.status, invoice.dueDate);
  const signed = invoice.signatureRequests.find(
    (request) => request.status === "SIGNED",
  );

  const clients =
    invoice.status === "DRAFT"
      ? await prisma.client.findMany({
          where: { workspaceId: workspace.id, archivedAt: null },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Invoice ${invoice.number}`}
        description={`${invoice.client.name} · ${formatIDR(invoice.total)}`}
        actions={
          <>
            <PrintButton />
            <InvoiceActions
              canManage
              invoice={{
                id: invoice.id,
                number: invoice.number,
                status: displayStatus,
                total: invoice.total,
                paid,
              }}
              signatures={invoice.signatureRequests.map((request) => ({
                id: request.id,
                status: request.status,
                createdAt: request.createdAt,
                expiresAt: request.expiresAt,
                signedAt: request.signedAt,
                signerName: request.signerName,
              }))}
            />
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <StatusBadge kind="invoice" value={displayStatus} />
        <span className="text-muted-foreground">
          Terbit {formatDate(invoice.issueDate)} · Jatuh tempo {formatDate(invoice.dueDate)}
        </span>
        {invoice.task ? (
          <Link
            href={`/dashboard/tasks/${invoice.task.id}`}
            className="text-muted-foreground hover:underline"
          >
            Dari tugas: {invoice.task.title}
          </Link>
        ) : null}
      </div>

      {invoice.status === "DRAFT" ? (
        <Card>
          <CardHeader>
            <CardTitle>Ubah invoice draft</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceForm
              clients={clients}
              defaultTaxRate={Number(workspace.defaultTaxRate)}
              backHref={`/dashboard/invoices/${invoice.id}`}
              initial={{
                id: invoice.id,
                clientId: invoice.clientId,
                issueDate: invoice.issueDate.toISOString().slice(0, 10),
                dueDate: invoice.dueDate.toISOString().slice(0, 10),
                discount: String(invoice.discount),
                taxRate: String(invoice.taxRate),
                note: invoice.note ?? "",
                items: invoice.items.map((item) => ({
                  description: item.description,
                  quantity: String(item.quantity),
                  unitPrice: String(item.unitPrice),
                })),
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <InvoiceDocument
          workspace={workspace}
          client={invoice.client}
          invoice={{
            number: invoice.number,
            status: displayStatus,
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
          signature={signed}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              <span className="text-muted-foreground">Dibayar: </span>
              {formatIDR(paid)}
              <span className="text-muted-foreground"> · Sisa: </span>
              {formatIDR(Math.max(invoice.total - paid, 0))}
            </p>
            {invoice.payments.length === 0 ? (
              <p className="text-muted-foreground text-sm">Belum ada pembayaran.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead>Dicatat</TableHead>
                    <TableHead className="text-right">Nominal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.paidAt)}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>{payment.recordedBy?.name ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        {formatIDR(payment.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tanda tangan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {invoice.signatureRequests.length === 0 ? (
              <p className="text-muted-foreground">
                Belum ada permintaan tanda tangan.
              </p>
            ) : (
              invoice.signatureRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
                >
                  <div>
                    <StatusBadge kind="signature" value={request.status} />
                    <p className="text-muted-foreground mt-1 text-xs">
                      Dibuat {formatDateTime(request.createdAt)} · berlaku sampai{" "}
                      {formatDate(request.expiresAt)}
                    </p>
                    {request.signerName ? (
                      <p className="text-xs">
                        Oleh {request.signerName} · {formatDateTime(request.signedAt)}
                      </p>
                    ) : null}
                  </div>
                  {request.status === "SIGNED" ? (
                    <Link
                      href={`/print/invoice/${invoice.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      Lihat dokumen
                    </Link>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
