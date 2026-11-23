import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, ListChecks, Users } from "lucide-react";

import { ArchiveClientButton } from "@/components/crm/archiveClientButton";
import { ClientFormDialog } from "@/components/crm/clientFormDialog";
import { ClientNotes } from "@/components/crm/clientNotes";
import { ContactDialog, type ContactValue } from "@/components/crm/contactDialog";
import { EmptyState } from "@/components/crm/emptyState";
import { PageHeader } from "@/components/crm/pageHeader";
import { StatCard } from "@/components/crm/statCard";
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
import { formatDate, formatIDR } from "@/lib/format";
import { resolveInvoiceStatus } from "@/lib/invoice";
import { requireWorkspace } from "@/services/auth/session";
import { prisma } from "@/services/prisma";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { workspace, membership } = await requireWorkspace();
  const canManage = membership.role === "OWNER" || membership.role === "ADMIN";

  const client = await prisma.client.findFirst({
    where: { id, workspaceId: workspace.id },
    include: {
      contacts: { orderBy: [{ isPrimary: "desc" }, { name: "asc" }] },
      clientNotes: {
        include: { author: { select: { name: true } } },
        orderBy: { occurredAt: "desc" },
      },
      invoices: {
        include: { payments: { select: { amount: true } } },
        orderBy: { issueDate: "desc" },
      },
      tasks: {
        include: { assignee: { select: { name: true } } },
        orderBy: [{ status: "asc" }, { dueDate: "asc" }],
      },
    },
  });

  if (!client) notFound();

  const invoices = client.invoices.map((invoice) => {
    const paid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
    return {
      ...invoice,
      paid,
      displayStatus: resolveInvoiceStatus(invoice.status, invoice.dueDate),
    };
  });

  const outstanding = invoices
    .filter(
      (invoice) =>
        invoice.displayStatus === "SENT" ||
        invoice.displayStatus === "PARTIALLY_PAID" ||
        invoice.displayStatus === "OVERDUE",
    )
    .reduce((sum, invoice) => sum + invoice.total - invoice.paid, 0);

  const openTasks = client.tasks.filter((task) => task.status !== "DONE").length;
  const primaryContact = client.contacts.find((contact) => contact.isPrimary);

  return (
    <div className="space-y-6">
      <PageHeader
        title={client.name}
        description={[client.email, client.phone].filter(Boolean).join(" · ") || undefined}
        actions={
          canManage ? (
            <>
              <ClientFormDialog
                trigger="Ubah klien"
                client={{
                  id: client.id,
                  name: client.name,
                  email: client.email ?? "",
                  phone: client.phone ?? "",
                  address: client.address ?? "",
                  taxId: client.taxId ?? "",
                  status: client.status,
                }}
              />
              <ArchiveClientButton clientId={client.id} />
            </>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge kind="client" value={client.status} />
        {client.archivedAt ? (
          <span className="text-muted-foreground text-xs">
            Diarsipkan {formatDate(client.archivedAt)}
          </span>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Tagihan belum dibayar"
          value={formatIDR(outstanding)}
          icon={FileText}
        />
        <StatCard label="Total invoice" value={String(invoices.length)} icon={FileText} />
        <StatCard label="Tugas terbuka" value={String(openTasks)} icon={ListChecks} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Kontak PIC
            </CardTitle>
            {canManage ? (
              <ContactDialog clientId={client.id} trigger="Tambah kontak" />
            ) : null}
          </CardHeader>
          <CardContent className="space-y-3">
            {client.contacts.length === 0 ? (
              <p className="text-muted-foreground text-sm">Belum ada kontak.</p>
            ) : (
              client.contacts.map((contact) => {
                const value: ContactValue = {
                  id: contact.id,
                  name: contact.name,
                  position: contact.position ?? "",
                  email: contact.email ?? "",
                  phone: contact.phone ?? "",
                  isPrimary: contact.isPrimary,
                };
                return (
                  <div
                    key={contact.id}
                    className="flex items-start justify-between gap-3 rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {contact.name}
                        {contact.isPrimary ? (
                          <span className="text-muted-foreground ml-2 text-xs">
                            Utama
                          </span>
                        ) : null}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {[contact.position, contact.email, contact.phone]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                    </div>
                    {canManage ? (
                      <ContactDialog
                        clientId={client.id}
                        contact={value}
                        trigger="Ubah"
                      />
                    ) : null}
                  </div>
                );
              })
            )}
            {primaryContact ? (
              <p className="text-muted-foreground text-xs">
                Kontak utama: {primaryContact.name}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Info klien</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Alamat: </span>
              {client.address ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">NPWP/ID pajak: </span>
              {client.taxId ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Dibuat: </span>
              {formatDate(client.createdAt)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice terkait</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-muted-foreground text-sm">Belum ada invoice.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Terbit</TableHead>
                  <TableHead>Jatuh tempo</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Sisa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Link
                        className="font-medium hover:underline"
                        href={`/dashboard/invoices/${invoice.id}`}
                      >
                        {invoice.number}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge kind="invoice" value={invoice.displayStatus} />
                    </TableCell>
                    <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell className="text-right">
                      {formatIDR(invoice.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatIDR(Math.max(invoice.total - invoice.paid, 0))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Catatan & timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientNotes
              clientId={client.id}
              canManage={canManage}
              notes={client.clientNotes.map((note) => ({
                id: note.id,
                content: note.content,
                occurredAt: note.occurredAt,
                authorName: note.author?.name ?? null,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tugas terkait</CardTitle>
          </CardHeader>
          <CardContent>
            {client.tasks.length === 0 ? (
              <p className="text-muted-foreground text-sm">Belum ada tugas.</p>
            ) : (
              <ul className="space-y-2">
                {client.tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div>
                      <Link
                        href={`/dashboard/tasks/${task.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {task.title}
                      </Link>
                      <p className="text-muted-foreground text-xs">
                        {task.assignee?.name ?? "Belum ditugaskan"} ·{" "}
                        {formatDate(task.dueDate)}
                      </p>
                    </div>
                    <StatusBadge kind="task" value={task.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {client.contacts.length === 0 && client.invoices.length === 0 ? (
        <EmptyState
          title="Lengkapi data klien"
          description="Tambahkan kontak PIC dan buat invoice pertama dari halaman ini."
        />
      ) : null}
    </div>
  );
}
