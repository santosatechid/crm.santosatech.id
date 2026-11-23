import Link from "next/link";
import { FileText } from "lucide-react";

import { EmptyState } from "@/components/crm/emptyState";
import { PageHeader } from "@/components/crm/pageHeader";
import { StatusBadge } from "@/components/crm/statusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatIDR, startOfToday } from "@/lib/format";
import { resolveInvoiceStatus } from "@/lib/invoice";
import type { Prisma } from "@/prisma/generated/client";
import { requireWorkspace } from "@/services/auth/session";
import { prisma } from "@/services/prisma";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS = [
  ["ALL", "Semua status"],
  ["DRAFT", "Draft"],
  ["SENT", "Terkirim"],
  ["PARTIALLY_PAID", "Dibayar Sebagian"],
  ["OVERDUE", "Jatuh Tempo"],
  ["PAID", "Lunas"],
  ["CANCELLED", "Dibatalkan"],
] as const;

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; clientId?: string; from?: string; to?: string }>;
}) {
  const { workspace } = await requireWorkspace(["OWNER", "ADMIN"]);
  const filters = await searchParams;
  const status = filters.status ?? "ALL";
  const clientId = filters.clientId ?? "ALL";
  const from = filters.from ?? "";
  const to = filters.to ?? "";

  const where: Prisma.InvoiceWhereInput = { workspaceId: workspace.id };

  if (clientId !== "ALL") where.clientId = clientId;
  if (from || to) {
    where.issueDate = {
      ...(from ? { gte: new Date(`${from}T00:00:00`) } : {}),
      ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}),
    };
  }
  if (status === "OVERDUE") {
    where.status = { in: ["SENT", "PARTIALLY_PAID"] };
    where.dueDate = { lt: startOfToday() };
  } else if (status !== "ALL") {
    where.status = status as "DRAFT" | "SENT" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
    if (status === "SENT" || status === "PARTIALLY_PAID") {
      where.dueDate = { gte: startOfToday() };
    }
  }

  const [invoices, clients] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        client: { select: { name: true } },
        payments: { select: { amount: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.client.findMany({
      where: { workspaceId: workspace.id, archivedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoice"
        description="Buat, kirim, dan catat pembayaran invoice klien."
        actions={
          <Button asChild>
            <Link href="/dashboard/invoices/new">Buat invoice</Link>
          </Button>
        }
      />

      <form className="flex flex-wrap items-end gap-2" method="get">
        <div className="space-y-1">
          <label className="text-muted-foreground text-xs" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
          >
            {STATUS_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-muted-foreground text-xs" htmlFor="clientId">
            Klien
          </label>
          <select
            id="clientId"
            name="clientId"
            defaultValue={clientId}
            className="border-input bg-background h-9 max-w-52 rounded-md border px-3 text-sm"
          >
            <option value="ALL">Semua klien</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-muted-foreground text-xs" htmlFor="from">
            Dari tanggal
          </label>
          <Input id="from" name="from" type="date" defaultValue={from} className="w-40" />
        </div>
        <div className="space-y-1">
          <label className="text-muted-foreground text-xs" htmlFor="to">
            Sampai tanggal
          </label>
          <Input id="to" name="to" type="date" defaultValue={to} className="w-40" />
        </div>
        <Button type="submit" variant="outline">
          Terapkan
        </Button>
        <Button asChild variant="ghost">
          <Link href="/dashboard/invoices">Reset</Link>
        </Button>
      </form>

      {invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Belum ada invoice"
          description="Invoice dapat dibuat dari halaman ini atau langsung dari detail tugas."
          action={
            <Button asChild>
              <Link href="/dashboard/invoices/new">Buat invoice</Link>
            </Button>
          }
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor</TableHead>
                <TableHead>Klien</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Terbit</TableHead>
                <TableHead>Jatuh tempo</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Sisa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                const paid = invoice.payments.reduce(
                  (sum, payment) => sum + payment.amount,
                  0,
                );
                const displayStatus = resolveInvoiceStatus(
                  invoice.status,
                  invoice.dueDate,
                );
                return (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="font-medium hover:underline"
                      >
                        {invoice.number}
                      </Link>
                    </TableCell>
                    <TableCell>{invoice.client.name}</TableCell>
                    <TableCell>
                      <StatusBadge kind="invoice" value={displayStatus} />
                    </TableCell>
                    <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell className="text-right">
                      {formatIDR(invoice.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatIDR(Math.max(invoice.total - paid, 0))}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
