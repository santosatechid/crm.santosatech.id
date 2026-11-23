"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";

import { createTask, updateTask } from "@/app/actions/tasks";
import { SelectField, TextAreaField, TextField } from "@/components/crm/formFields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type TaskFormValue = {
  id?: string;
  title: string;
  description: string;
  clientId: string;
  assigneeId: string;
  dueDate: string;
  priority: string;
  status: string;
};

export function TaskDialog({
  clients,
  members,
  task,
  trigger,
}: {
  clients: Array<{ id: string; name: string }>;
  members: Array<{ id: string; name: string }>;
  task?: TaskFormValue;
  trigger: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<TaskFormValue>(
    task ?? {
      title: "",
      description: "",
      clientId: "NONE",
      assigneeId: "NONE",
      dueDate: "",
      priority: "MEDIUM",
      status: "TODO",
    },
  );

  const update = (patch: Partial<TaskFormValue>) =>
    setForm((current) => ({ ...current, ...patch }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const payload = {
        title: form.title,
        description: form.description,
        clientId: form.clientId === "NONE" ? null : form.clientId,
        assigneeId: form.assigneeId === "NONE" ? null : form.assigneeId,
        dueDate: form.dueDate || null,
        priority: form.priority,
        status: form.status,
      };
      const result = task?.id
        ? await updateTask(task.id, payload)
        : await createTask(payload);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={task ? "sm" : "default"} variant={task ? "outline" : "default"}>
          {trigger}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Ubah tugas" : "Tambah tugas"}</DialogTitle>
          <DialogDescription>
            Tugas dapat ditautkan ke klien dan ditagihkan menjadi invoice.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            id="task-title"
            label="Judul"
            value={form.title}
            onChange={(title) => update({ title })}
            required
          />
          <TextAreaField
            id="task-description"
            label="Deskripsi"
            value={form.description}
            onChange={(description) => update({ description })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              id="task-client"
              label="Klien"
              value={form.clientId}
              onChange={(clientId) => update({ clientId })}
              options={[
                { value: "NONE", label: "Tanpa klien" },
                ...clients.map((client) => ({ value: client.id, label: client.name })),
              ]}
            />
            <SelectField
              id="task-assignee"
              label="Penanggung jawab"
              value={form.assigneeId}
              onChange={(assigneeId) => update({ assigneeId })}
              options={[
                { value: "NONE", label: "Belum ditugaskan" },
                ...members.map((member) => ({ value: member.id, label: member.name })),
              ]}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              id="task-due"
              label="Tenggat"
              type="date"
              value={form.dueDate}
              onChange={(dueDate) => update({ dueDate })}
            />
            <SelectField
              id="task-priority"
              label="Prioritas"
              value={form.priority}
              onChange={(priority) => update({ priority })}
              options={[
                { value: "LOW", label: "Rendah" },
                { value: "MEDIUM", label: "Sedang" },
                { value: "HIGH", label: "Tinggi" },
              ]}
            />
            <SelectField
              id="task-status"
              label="Status"
              value={form.status}
              onChange={(status) => update({ status })}
              options={[
                { value: "TODO", label: "To Do" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "DONE", label: "Selesai" },
              ]}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
