"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/services/prisma";
import { requireWorkspaceAction } from "@/services/auth/session";
import { sendEmail } from "@/services/email";
import { commentSchema, parseInput, taskSchema, taskStatusSchema } from "@/lib/validation";
import { runAction } from "@/lib/action";
import { fail, ok, type ActionResult } from "@/lib/result";
import { formatDate, parseDateInput } from "@/lib/format";

async function assertWorkspaceRefs(
  workspaceId: string,
  clientId: string | null,
  assigneeId: string | null,
) {
  if (clientId) {
    const client = await prisma.client.findFirst({
      where: { id: clientId, workspaceId },
      select: { id: true },
    });
    if (!client) throw new Error("Klien tidak ditemukan.");
  }
  if (assigneeId) {
    const member = await prisma.membership.findFirst({
      where: { workspaceId, userId: assigneeId },
      select: { id: true },
    });
    if (!member) throw new Error("Penanggung jawab bukan anggota workspace.");
  }
}

async function notifyAssignee(
  workspaceName: string,
  assigneeId: string,
  taskTitle: string,
  dueDate: Date | null,
) {
  const assignee = await prisma.user.findUnique({
    where: { id: assigneeId },
    select: { email: true, name: true },
  });
  if (!assignee?.email) return;

  await sendEmail({
    to: assignee.email,
    subject: `Tugas baru: ${taskTitle}`,
    html: `<p>Halo ${assignee.name},</p><p>Anda ditugaskan pada "${taskTitle}" di ${workspaceName}.${dueDate ? ` Tenggat: ${formatDate(dueDate)}.` : ""}</p>`,
  });
}

export async function createTask(input: unknown): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const { workspace, user } = await requireWorkspaceAction();
    const parsed = parseInput(taskSchema, input);
    if (!parsed.ok) return fail(parsed.message);
    const data = parsed.data;

    await assertWorkspaceRefs(workspace.id, data.clientId, data.assigneeId);

    const task = await prisma.task.create({
      data: {
        workspaceId: workspace.id,
        title: data.title,
        description: data.description,
        clientId: data.clientId,
        assigneeId: data.assigneeId,
        dueDate: data.dueDate ? parseDateInput(data.dueDate) : null,
        priority: data.priority,
        status: data.status,
        createdById: user.id,
        completedAt: data.status === "DONE" ? new Date() : null,
      },
      select: { id: true, title: true, dueDate: true },
    });

    if (data.assigneeId) {
      await notifyAssignee(workspace.name, data.assigneeId, task.title, task.dueDate);
    }

    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard");
    return ok("Tugas dibuat.", { id: task.id });
  });
}

export async function updateTask(taskId: string, input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const { workspace } = await requireWorkspaceAction();
    const parsed = parseInput(taskSchema, input);
    if (!parsed.ok) return fail(parsed.message);
    const data = parsed.data;

    const existing = await prisma.task.findFirst({
      where: { id: taskId, workspaceId: workspace.id },
      select: { id: true, assigneeId: true },
    });
    if (!existing) throw new Error("Tugas tidak ditemukan.");

    await assertWorkspaceRefs(workspace.id, data.clientId, data.assigneeId);

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description,
        clientId: data.clientId,
        assigneeId: data.assigneeId,
        dueDate: data.dueDate ? parseDateInput(data.dueDate) : null,
        priority: data.priority,
        status: data.status,
        completedAt: data.status === "DONE" ? new Date() : null,
      },
      select: { title: true, dueDate: true },
    });

    if (data.assigneeId && data.assigneeId !== existing.assigneeId) {
      await notifyAssignee(workspace.name, data.assigneeId, task.title, task.dueDate);
    }

    revalidatePath("/dashboard/tasks");
    revalidatePath(`/dashboard/tasks/${taskId}`);
    revalidatePath("/dashboard");
    return ok("Tugas diperbarui.");
  });
}

export async function updateTaskStatus(
  input: unknown,
): Promise<ActionResult> {
  return runAction(async () => {
    const { workspace } = await requireWorkspaceAction();
    const parsed = parseInput(taskStatusSchema, input);
    if (!parsed.ok) return fail(parsed.message);

    const task = await prisma.task.findFirst({
      where: { id: parsed.data.taskId, workspaceId: workspace.id },
      select: { id: true },
    });
    if (!task) throw new Error("Tugas tidak ditemukan.");

    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: parsed.data.status,
        completedAt: parsed.data.status === "DONE" ? new Date() : null,
      },
    });

    revalidatePath("/dashboard/tasks");
    revalidatePath(`/dashboard/tasks/${task.id}`);
    revalidatePath("/dashboard");
    return ok("Status tugas diperbarui.");
  });
}

export async function deleteTask(taskId: string): Promise<ActionResult> {
  return runAction(async () => {
    const { workspace } = await requireWorkspaceAction();
    const task = await prisma.task.findFirst({
      where: { id: taskId, workspaceId: workspace.id },
      select: { id: true },
    });
    if (!task) throw new Error("Tugas tidak ditemukan.");

    await prisma.task.delete({ where: { id: task.id } });
    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard");
    return ok("Tugas dihapus.");
  });
}

export async function addTaskComment(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const { workspace, user } = await requireWorkspaceAction();
    const parsed = parseInput(commentSchema, input);
    if (!parsed.ok) return fail(parsed.message);

    const task = await prisma.task.findFirst({
      where: { id: parsed.data.taskId, workspaceId: workspace.id },
      select: { id: true },
    });
    if (!task) throw new Error("Tugas tidak ditemukan.");

    await prisma.taskComment.create({
      data: {
        taskId: task.id,
        authorId: user.id,
        content: parsed.data.content,
      },
    });
    revalidatePath(`/dashboard/tasks/${task.id}`);
    return ok("Komentar ditambahkan.");
  });
}

export async function deleteTaskComment(commentId: string): Promise<ActionResult> {
  return runAction(async () => {
    const { workspace, user } = await requireWorkspaceAction();
    const comment = await prisma.taskComment.findFirst({
      where: { id: commentId, task: { workspaceId: workspace.id } },
      select: { id: true, authorId: true, taskId: true },
    });
    if (!comment) throw new Error("Komentar tidak ditemukan.");
    if (comment.authorId !== user.id) throw new Error("Hanya penulis yang dapat menghapus komentar.");

    await prisma.taskComment.delete({ where: { id: comment.id } });
    revalidatePath(`/dashboard/tasks/${comment.taskId}`);
    return ok("Komentar dihapus.");
  });
}
