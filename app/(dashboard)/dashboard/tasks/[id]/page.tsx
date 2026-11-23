import Link from "next/link";
import { notFound } from "next/navigation";

import { CreateInvoiceFromTaskButton } from "@/components/crm/createInvoiceFromTaskButton";
import { DeleteTaskButton } from "@/components/crm/deleteTaskButton";
import { PageHeader } from "@/components/crm/pageHeader";
import { StatusBadge } from "@/components/crm/statusBadge";
import { TaskComments } from "@/components/crm/taskComments";
import { TaskDialog } from "@/components/crm/taskDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dateInputValue, formatDate, formatIDR } from "@/lib/format";
import { canManageBilling } from "@/lib/permissions";
import { resolveInvoiceStatus } from "@/lib/invoice";
import { requireWorkspace } from "@/services/auth/session";
import { prisma } from "@/services/prisma";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { workspace, user, membership } = await requireWorkspace();

  const [task, clients, memberships] = await Promise.all([
    prisma.task.findFirst({
      where: { id, workspaceId: workspace.id },
      include: {
        client: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
        createdBy: { select: { name: true } },
        comments: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
        invoices: {
          include: { payments: { select: { amount: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.client.findMany({
      where: { workspaceId: workspace.id, archivedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.membership.findMany({
      where: { workspaceId: workspace.id },
      include: { user: { select: { id: true, name: true } } },
    }),
  ]);

  if (!task) notFound();

  const canBill = canManageBilling(membership.role);
  const memberOptions = memberships.map((membership) => ({
    id: membership.user.id,
    name: membership.user.name,
  }));

  const editDialog = (
    <TaskDialog
      clients={clients}
      members={memberOptions}
      trigger="Ubah tugas"
      task={{
        id: task.id,
        title: task.title,
        description: task.description ?? "",
        clientId: task.clientId ?? "NONE",
        assigneeId: task.assigneeId ?? "NONE",
        dueDate: task.dueDate ? dateInputValue(task.dueDate) : "",
        priority: task.priority,
        status: task.status,
      }}
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={task.title}
        description={
          [task.client?.name, task.assignee?.name].filter(Boolean).join(" · ") ||
          "Tanpa klien"
        }
        actions={
          <>
            {editDialog}
            {canBill && task.clientId ? (
              <CreateInvoiceFromTaskButton taskId={task.id} />
            ) : null}
            <DeleteTaskButton taskId={task.id} />
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge kind="task" value={task.status} />
        <StatusBadge kind="priority" value={task.priority} />
        <span className="text-muted-foreground text-sm">
          Tenggat {formatDate(task.dueDate)}
        </span>
        {task.client ? (
          <Link
            href={`/dashboard/clients/${task.client.id}`}
            className="text-muted-foreground text-sm hover:underline"
          >
            Klien: {task.client.name}
          </Link>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deskripsi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">
            {task.description || "Belum ada deskripsi."}
          </p>
          <p className="text-muted-foreground mt-3 text-xs">
            Dibuat oleh {task.createdBy?.name ?? "—"} · {formatDate(task.createdAt)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice dari tugas ini</CardTitle>
        </CardHeader>
        <CardContent>
          {task.invoices.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Belum ada invoice. {canBill ? "Gunakan tombol Buat invoice di atas." : ""}
            </p>
          ) : (
            <ul className="space-y-2">
              {task.invoices.map((invoice) => {
                const paid = invoice.payments.reduce(
                  (sum, payment) => sum + payment.amount,
                  0,
                );
                return (
                  <li
                    key={invoice.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
                  >
                    <Link
                      href={`/dashboard/invoices/${invoice.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {invoice.number}
                    </Link>
                    <div className="flex items-center gap-3 text-sm">
                      <StatusBadge
                        kind="invoice"
                        value={resolveInvoiceStatus(invoice.status, invoice.dueDate)}
                      />
                      <span>{formatIDR(invoice.total)}</span>
                      <span className="text-muted-foreground text-xs">
                        sisa {formatIDR(Math.max(invoice.total - paid, 0))}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Komentar</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskComments
            taskId={task.id}
            currentUserId={user.id}
            comments={task.comments.map((comment) => ({
              id: comment.id,
              content: comment.content,
              createdAt: comment.createdAt,
              authorId: comment.author?.id ?? null,
              authorName: comment.author?.name ?? null,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
