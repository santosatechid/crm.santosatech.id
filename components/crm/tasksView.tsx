"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { updateTaskStatus } from "@/app/actions/tasks";
import { EmptyState } from "@/components/crm/emptyState";
import { StatusBadge } from "@/components/crm/statusBadge";
import { TaskDialog } from "@/components/crm/taskDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/format";

export type TaskListItem = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  clientId: string | null;
  clientName: string | null;
  assigneeName: string | null;
  assigneeId: string | null;
};

const COLUMNS = [
  { status: "TODO", label: "To Do" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "DONE", label: "Selesai" },
];

export function TasksView({
  tasks,
  clients,
  members,
  currentUserId,
}: {
  tasks: TaskListItem[];
  clients: Array<{ id: string; name: string }>;
  members: Array<{ id: string; name: string }>;
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [assignee, setAssignee] = useState("ALL");
  const [clientId, setClientId] = useState("ALL");
  const filtered = useMemo(
    () =>
      tasks.filter((task) => {
        if (assignee === "MINE" && task.assigneeId !== currentUserId) return false;
        if (assignee !== "ALL" && assignee !== "MINE" && task.assigneeId !== assignee) {
          return false;
        }
        if (clientId !== "ALL" && task.clientId !== clientId) return false;
        return true;
      }),
    [tasks, assignee, clientId, currentUserId],
  );

  const moveTask = (taskId: string, status: string) => {
    startTransition(async () => {
      const result = await updateTaskStatus({ taskId, status });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      router.refresh();
    });
  };

  const createButton = (
    <TaskDialog
      clients={clients}
      members={members}
      trigger={
        <>
          <Plus className="mr-1 h-4 w-4" /> Tambah tugas
        </>
      }
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={assignee} onValueChange={setAssignee}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua penanggung jawab</SelectItem>
            <SelectItem value="MINE">Tugas saya</SelectItem>
            {members.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={clientId} onValueChange={setClientId}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua klien</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {createButton}
      </div>

      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">Papan</TabsTrigger>
          <TabsTrigger value="list">Daftar</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="pt-4">
          {filtered.length === 0 ? (
            <EmptyState
              title="Belum ada tugas"
              description="Buat tugas pertama, lalu tarik kartu antar kolom untuk mengubah status."
              action={createButton}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {COLUMNS.map((column) => (
                <div
                  key={column.status}
                  data-column={column.status}
                  className="bg-muted/40 min-h-40 space-y-2 rounded-lg border p-3"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const taskId = event.dataTransfer.getData("text/plain");
                    if (taskId) moveTask(taskId, column.status);
                  }}
                >
                  <p className="text-sm font-medium">{column.label}</p>
                  {filtered
                    .filter((task) => task.status === column.status)
                    .map((task) => (
                      <div
                        key={task.id}
                        draggable
                        data-task={task.id}
                        onDragStart={(event) => {
                          event.dataTransfer.setData("text/plain", task.id);
                          event.dataTransfer.effectAllowed = "move";
                        }}
                        className="bg-background cursor-grab space-y-1 rounded-md border p-3 shadow-sm"
                      >
                        <Link
                          href={`/dashboard/tasks/${task.id}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {task.title}
                        </Link>
                        <p className="text-muted-foreground text-xs">
                          {[task.clientName, task.assigneeName]
                            .filter(Boolean)
                            .join(" · ") || "Tanpa klien"}
                        </p>
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <StatusBadge kind="priority" value={task.priority} />
                          <span className="text-muted-foreground text-xs">
                            {formatDate(task.dueDate)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          )}
          {pending ? (
            <p className="text-muted-foreground pt-2 text-xs">Menyimpan...</p>
          ) : null}
        </TabsContent>

        <TabsContent value="list" className="pt-4">
          {filtered.length === 0 ? (
            <EmptyState title="Belum ada tugas" action={createButton} />
          ) : (
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted text-left">
                  <tr>
                    <th className="p-3">Judul</th>
                    <th className="p-3">Klien</th>
                    <th className="p-3">Penanggung jawab</th>
                    <th className="p-3">Prioritas</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Tenggat</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((task) => (
                    <tr key={task.id} className="border-t">
                      <td className="p-3">
                        <Link
                          href={`/dashboard/tasks/${task.id}`}
                          className="font-medium hover:underline"
                        >
                          {task.title}
                        </Link>
                      </td>
                      <td className="p-3">{task.clientName ?? "—"}</td>
                      <td className="p-3">{task.assigneeName ?? "—"}</td>
                      <td className="p-3">
                        <StatusBadge kind="priority" value={task.priority} />
                      </td>
                      <td className="p-3">
                        <StatusBadge kind="task" value={task.status} />
                      </td>
                      <td className="p-3">{formatDate(task.dueDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
