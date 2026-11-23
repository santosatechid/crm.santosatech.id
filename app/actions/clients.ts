"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/services/prisma";
import { requireWorkspaceAction } from "@/services/auth/session";
import { parseInput } from "@/lib/validation";
import { clientSchema, contactSchema, noteSchema } from "@/lib/validation";
import { runAction } from "@/lib/action";
import { fail, ok, type ActionResult } from "@/lib/result";
import { parseDateInput } from "@/lib/format";

const MANAGE: Array<"OWNER" | "ADMIN"> = ["OWNER", "ADMIN"];

export async function createClient(input: unknown): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const { workspace, user } = await requireWorkspaceAction(MANAGE);
    const parsed = parseInput(clientSchema, input);
    if (!parsed.ok) return fail(parsed.message);

    const client = await prisma.client.create({
      data: { ...parsed.data, workspaceId: workspace.id, createdById: user.id },
      select: { id: true },
    });
    await prisma.activityLog.create({
      data: {
        workspaceId: workspace.id,
        actorId: user.id,
        action: "client.created",
        entityType: "Client",
        entityId: client.id,
        metadata: { name: parsed.data.name },
      },
    });
    revalidatePath("/dashboard/clients");
    return ok("Klien ditambahkan.", { id: client.id });
  });
}

export async function updateClient(
  clientId: string,
  input: unknown,
): Promise<ActionResult> {
  return runAction(async () => {
    const { workspace, user } = await requireWorkspaceAction(MANAGE);
    const parsed = parseInput(clientSchema, input);
    if (!parsed.ok) return fail(parsed.message);

    const existing = await prisma.client.findFirst({
      where: { id: clientId, workspaceId: workspace.id },
      select: { id: true },
    });
    if (!existing) throw new Error("Klien tidak ditemukan.");

    await prisma.$transaction(async (tx) => {
      await tx.client.update({ where: { id: clientId }, data: parsed.data });
      await tx.activityLog.create({
        data: {
          workspaceId: workspace.id,
          actorId: user.id,
          action: "client.updated",
          entityType: "Client",
          entityId: clientId,
        },
      });
    });
    revalidatePath("/dashboard/clients");
    revalidatePath(`/dashboard/clients/${clientId}`);
    return ok("Klien diperbarui.");
  });
}

export async function archiveClient(clientId: string): Promise<ActionResult> {
  return runAction(async () => {
    const { workspace, user } = await requireWorkspaceAction(MANAGE);
    const existing = await prisma.client.findFirst({
      where: { id: clientId, workspaceId: workspace.id },
    });
    if (!existing) throw new Error("Klien tidak ditemukan.");

    await prisma.$transaction(async (tx) => {
      await tx.client.update({
        where: { id: clientId },
        data: { archivedAt: new Date() },
      });
      await tx.activityLog.create({
        data: {
          workspaceId: workspace.id,
          actorId: user.id,
          action: "client.archived",
          entityType: "Client",
          entityId: clientId,
        },
      });
    });
    revalidatePath("/dashboard/clients");
    revalidatePath(`/dashboard/clients/${clientId}`);
    return ok("Klien diarsipkan.");
  });
}

export async function createContact(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const { workspace } = await requireWorkspaceAction(MANAGE);
    const parsed = parseInput(contactSchema, input);
    if (!parsed.ok) return fail(parsed.message);

    const client = await prisma.client.findFirst({
      where: { id: parsed.data.clientId, workspaceId: workspace.id },
      select: { id: true },
    });
    if (!client) throw new Error("Klien tidak ditemukan.");

    await prisma.$transaction(async (tx) => {
      if (parsed.data.isPrimary) {
        await tx.contact.updateMany({
          where: { clientId: client.id },
          data: { isPrimary: false },
        });
      }
      await tx.contact.create({ data: parsed.data });
    });
    revalidatePath(`/dashboard/clients/${client.id}`);
    return ok("Kontak ditambahkan.");
  });
}

export async function updateContact(
  contactId: string,
  input: unknown,
): Promise<ActionResult> {
  return runAction(async () => {
    const { workspace } = await requireWorkspaceAction(MANAGE);
    const parsed = parseInput(contactSchema, input);
    if (!parsed.ok) return fail(parsed.message);

    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        client: { workspaceId: workspace.id },
      },
      select: { id: true, clientId: true },
    });
    if (!contact) throw new Error("Kontak tidak ditemukan.");

    await prisma.$transaction(async (tx) => {
      if (parsed.data.isPrimary) {
        await tx.contact.updateMany({
          where: { clientId: contact.clientId },
          data: { isPrimary: false },
        });
      }
      await tx.contact.update({ where: { id: contactId }, data: parsed.data });
    });
    revalidatePath(`/dashboard/clients/${contact.clientId}`);
    return ok("Kontak diperbarui.");
  });
}

export async function deleteContact(contactId: string): Promise<ActionResult> {
  return runAction(async () => {
    const { workspace } = await requireWorkspaceAction(MANAGE);
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, client: { workspaceId: workspace.id } },
      select: { id: true, clientId: true },
    });
    if (!contact) throw new Error("Kontak tidak ditemukan.");

    await prisma.contact.delete({ where: { id: contactId } });
    revalidatePath(`/dashboard/clients/${contact.clientId}`);
    return ok("Kontak dihapus.");
  });
}

export async function createClientNote(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const { workspace, user } = await requireWorkspaceAction(MANAGE);
    const parsed = parseInput(noteSchema, input);
    if (!parsed.ok) return fail(parsed.message);

    const client = await prisma.client.findFirst({
      where: { id: parsed.data.clientId, workspaceId: workspace.id },
      select: { id: true },
    });
    if (!client) throw new Error("Klien tidak ditemukan.");

    await prisma.clientNote.create({
      data: {
        clientId: client.id,
        authorId: user.id,
        content: parsed.data.content,
        occurredAt: parseDateInput(parsed.data.occurredAt),
      },
    });
    revalidatePath(`/dashboard/clients/${client.id}`);
    return ok("Catatan ditambahkan.");
  });
}

export async function deleteClientNote(noteId: string): Promise<ActionResult> {
  return runAction(async () => {
    const { workspace } = await requireWorkspaceAction(MANAGE);
    const note = await prisma.clientNote.findFirst({
      where: { id: noteId, client: { workspaceId: workspace.id } },
      select: { id: true, clientId: true },
    });
    if (!note) throw new Error("Catatan tidak ditemukan.");

    await prisma.clientNote.delete({ where: { id: noteId } });
    revalidatePath(`/dashboard/clients/${note.clientId}`);
    return ok("Catatan dihapus.");
  });
}
