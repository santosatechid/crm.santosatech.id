import Link from "next/link";
import {
  AlertTriangle,
  CheckSquare,
  FileText,
  Users,
  Wallet,
} from "lucide-react";

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
import {
  endsWithToday,
  formatDate,
  formatIDR,
  startOfMonth,
  startOfToday,
} from "@/lib/format";
import { canManageBilling } from "@/lib/permissions";
import { resolveInvoiceStatus } from "@/lib/invoice";
import { requireWorkspace } from "@/services/auth/session";
import { prisma } from "@/services/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { workspace, user, membership } = await requireWorkspace();
  const billing = canManageBilling(membership.role);

  const [activeClients, openTasks, overdueTasks] = await Promise.all([
    prisma.client.count({
      where: { workspaceId: workspace.id, status: "ACTIVE", archivedAt: null },
    }),
    prisma.task.count({
      where: { workspaceId: workspace.id, status: { not: "DONE" } },
    }),
    prisma.task.count({
      where: {
        workspaceId: workspace.id,
        status: { not: "DONE" },
        dueDate: { lt: startOfToday() },
      },
    }),
  ]);

  if (!billing) {
    const [todayTasks, myOverdue] = await Promise.all([
      prisma.task.findMany({
        where: {
          workspaceId: workspace.id,
          assigneeId: user.id,
          status: { not: "DONE" },
          dueDate: { gte: startOfToday(), lt: endsWithToday() },
        },
        orderBy: { dueDate: "asc" },
      }),
      prisma.task.findMany({
        where: {
          workspaceId: workspace.id,
          assigneeId: user.id,
          status: { not: "DONE" },
          dueDate: { lt: startOfToday() },
        },
        orderBy: { dueDate: "asc" },
      }),
    ]);

    return (
      <div className="space-y-6">
        <PageHeader
          title={`Halo, ${user.name}`}
          description={`Ringkasan pekerjaan Anda di ${workspace.name}.`}
        />
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Tugas hari ini" value={String(todayTasks.length)} icon={CheckSquare} />
          <StatCard label="Tugas terlambat" value={String(myOverdue.length)} icon={AlertTriangle} />
          <StatCard label="Tugas terbuka" value={String(openTasks)} icon={CheckSquare} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tugas saya</CardTitle>
          </CardHeader>
          <CardContent>
            {[...myOverdue, ...todayTasks].length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Tidak ada tugas untuk hari ini.
              </p>
            ) : (
              <ul className="space-y-2">
                {[...myOverdue, ...todayTasks].map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between gap-2 rounded-lg border p-3"
                  >
                    <Link
                      href={`/dashboard/tasks/${task.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {task.title}
                    </Link>
                    <span className="text-muted-foreground text-xs">
                      {formatDate(task.dueDate)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const [invoices, paymentsThisMonth, recentTasks] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        workspaceId: workspace.id,
        status: { in: ["SENT", "PARTIALLY_PAID"] },
      },
      include: { payments: { select: { amount: true } }, client: { select: { name: true } } },
      orderBy: { dueDate: "asc" },
      take: 100,
    }),
    prisma.payment.aggregate({
      where: {
        invoice: { workspaceId: workspace.id },
        paidAt: { gte: startOfMonth() },
      },
      _sum: { amount: true },
    }),
    prisma.task.findMany({
      where: { workspaceId: workspace.id, status: { not: "DONE" } },
      orderBy: [{ dueDate: "asc" }],
      take: 5,
      include: { assignee: { select: { name: true } } },
    }),
  ]);

  const unpaidInvoices = invoices.map((invoice) => {
    const paid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
    return {
      ...invoice,
      paid,
      remaining: invoice.total - paid,
      displayStatus: resolveInvoiceStatus(invoice.status, invoice.dueDate),
    };
  });

  const outstanding = unpaidInvoices.reduce(
    (sum, invoice) => sum + Math.max(invoice.remaining, 0),
    0,
  );
  const overdue = unpaidInvoices.filter(
    (invoice) => invoice.displayStatus === "OVERDUE",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Halo, ${user.name}`}
        description={`Kondisi ${workspace.name} hari ini.`}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Klien aktif" value={String(activeClients)} icon={Users} />
        <StatCard
          label="Invoice belum dibayar"
          value={String(unpaidInvoices.length)}
          hint={formatIDR(outstanding)}
          icon={FileText}
        />
        <StatCard
          label="Invoice jatuh tempo"
          value={String(overdue.length)}
          hint={formatIDR(
            overdue.reduce((sum, invoice) => sum + Math.max(invoice.remaining, 0), 0),
          )}
          icon={AlertTriangle}
        />
        <StatCard
          label="Diterima bulan ini"
          value={formatIDR(paymentsThisMonth._sum.amount ?? 0)}
          icon={Wallet}
        />
        <StatCard label="Tugas terlambat" value={String(overdueTasks)} icon={CheckSquare} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice belum lunas</CardTitle>
          </CardHeader>
          <CardContent>
            {unpaidInvoices.length === 0 ? (
              <p className="text-muted-foreground text-sm">Semua invoice beres.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nomor</TableHead>
                    <TableHead>Klien</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Sisa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unpaidInvoices.slice(0, 8).map((invoice) => (
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
                        <StatusBadge kind="invoice" value={invoice.displayStatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        {formatIDR(Math.max(invoice.remaining, 0))}
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
            <CardTitle>Tugas terdekat</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <p className="text-muted-foreground text-sm">Tidak ada tugas terbuka.</p>
            ) : (
              <ul className="space-y-2">
                {recentTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between gap-2 rounded-lg border p-3"
                  >
                    <Link
                      href={`/dashboard/tasks/${task.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {task.title}
                    </Link>
                    <span className="text-muted-foreground text-xs">
                      {task.assignee?.name ?? "Belum ditugaskan"} ·{" "}
                      {formatDate(task.dueDate)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
