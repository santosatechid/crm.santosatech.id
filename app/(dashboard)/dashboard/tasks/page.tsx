import { TasksView } from "@/components/crm/tasksView";
import { PageHeader } from "@/components/crm/pageHeader";
import { requireWorkspace } from "@/services/auth/session";
import { prisma } from "@/services/prisma";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const { workspace, user } = await requireWorkspace();

  const [tasks, clients, memberships] = await Promise.all([
    prisma.task.findMany({
      where: { workspaceId: workspace.id },
      include: {
        client: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
      take: 500,
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tugas"
        description="Papan dan daftar pekerjaan tim. Tarik kartu untuk mengubah status."
      />
      <TasksView
        tasks={tasks.map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          clientId: task.client?.id ?? null,
          clientName: task.client?.name ?? null,
          assigneeId: task.assigneeId,
          assigneeName: task.assignee?.name ?? null,
        }))}
        clients={clients}
        members={memberships.map((membership) => ({
          id: membership.user.id,
          name: membership.user.name,
        }))}
        currentUserId={user.id}
      />
    </div>
  );
}
