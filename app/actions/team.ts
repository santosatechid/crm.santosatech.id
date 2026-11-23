"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/services/prisma";
import { getCurrentUser, requireWorkspaceAction } from "@/services/auth/session";
import { sendEmail } from "@/services/email";
import { inviteSchema, memberRoleSchema, parseInput } from "@/lib/validation";
import { runAction } from "@/lib/action";
import { fail, ok, type ActionResult } from "@/lib/result";
import { createSigningToken, hashToken } from "@/lib/token";

function appUrl(): string {
  return process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
}

export async function inviteMember(
  input: unknown,
): Promise<ActionResult<{ link: string; emailSent: boolean; reason?: string }>> {
  return runAction(async () => {
    const { workspace, user } = await requireWorkspaceAction(["OWNER", "ADMIN"]);
    const parsed = parseInput(inviteSchema, input);
    if (!parsed.ok) return fail(parsed.message);
    const email = parsed.data.email.toLowerCase();

    const member = await prisma.membership.findFirst({
      where: {
        workspaceId: workspace.id,
        user: { email },
      },
      select: { id: true },
    });
    if (member) throw new Error("Email ini sudah menjadi anggota workspace.");

    const token = createSigningToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.workspaceInvite.upsert({
      where: { workspaceId_email: { workspaceId: workspace.id, email } },
      create: {
        workspaceId: workspace.id,
        email,
        role: parsed.data.role,
        token: hashToken(token),
        invitedById: user.id,
        expiresAt,
      },
      update: {
        role: parsed.data.role,
        token: hashToken(token),
        invitedById: user.id,
        expiresAt,
        acceptedAt: null,
      },
    });

    const link = `${appUrl()}/invite/${token}`;
    const emailResult = await sendEmail({
      to: email,
      subject: `Undangan bergabung dengan ${workspace.name}`,
      html: `<p>Anda diundang bergabung dengan workspace ${workspace.name} sebagai ${parsed.data.role.toLowerCase()}.</p><p><a href="${link}">${link}</a></p><p>Tautan berlaku 7 hari.</p>`,
    });

    revalidatePath("/dashboard/settings");
    return ok("Undangan dibuat.", {
      link,
      emailSent: emailResult.sent,
      reason: emailResult.reason,
    });
  });
}

export async function updateMemberRole(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const { workspace } = await requireWorkspaceAction(["OWNER"]);
    const parsed = parseInput(memberRoleSchema, input);
    if (!parsed.ok) return fail(parsed.message);

    const membership = await prisma.membership.findFirst({
      where: { id: parsed.data.membershipId, workspaceId: workspace.id },
      select: { id: true, role: true },
    });
    if (!membership) throw new Error("Anggota tidak ditemukan.");

    if (membership.role === "OWNER" && parsed.data.role !== "OWNER") {
      const owners = await prisma.membership.count({
        where: { workspaceId: workspace.id, role: "OWNER" },
      });
      if (owners <= 1) throw new Error("Workspace harus punya minimal satu Owner.");
    }

    await prisma.membership.update({
      where: { id: membership.id },
      data: { role: parsed.data.role },
    });
    revalidatePath("/dashboard/settings");
    return ok("Peran anggota diperbarui.");
  });
}

export async function removeMember(membershipId: string): Promise<ActionResult> {
  return runAction(async () => {
    const { workspace } = await requireWorkspaceAction(["OWNER", "ADMIN"]);
    const membership = await prisma.membership.findFirst({
      where: { id: membershipId, workspaceId: workspace.id },
      select: { id: true, role: true },
    });
    if (!membership) throw new Error("Anggota tidak ditemukan.");

    if (membership.role === "OWNER") {
      const owners = await prisma.membership.count({
        where: { workspaceId: workspace.id, role: "OWNER" },
      });
      if (owners <= 1) throw new Error("Owner terakhir tidak dapat dikeluarkan.");
    }

    await prisma.membership.delete({ where: { id: membership.id } });
    revalidatePath("/dashboard/settings");
    return ok("Anggota dikeluarkan dari workspace.");
  });
}

export async function acceptInvite(token: string): Promise<ActionResult<{ workspaceName: string }>> {
  return runAction(async () => {
    const user = await getCurrentUser();
    if (!user) throw new Error("Masuk atau daftar terlebih dahulu untuk menerima undangan.");

    const invite = await prisma.workspaceInvite.findUnique({
      where: { token: hashToken(token) },
      include: { workspace: { select: { id: true, name: true } } },
    });
    if (!invite) throw new Error("Undangan tidak ditemukan.");
    if (invite.acceptedAt) throw new Error("Undangan sudah digunakan.");
    if (invite.expiresAt.getTime() < Date.now()) throw new Error("Undangan sudah kedaluwarsa.");
    if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
      throw new Error("Undangan ini ditujukan untuk alamat email lain.");
    }

    const existing = await prisma.membership.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    if (existing) throw new Error("Akun ini sudah tergabung di workspace lain.");

    await prisma.$transaction(async (tx) => {
      await tx.membership.create({
        data: { userId: user.id, workspaceId: invite.workspaceId, role: invite.role },
      });
      await tx.workspaceInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });
    });

    revalidatePath("/dashboard");
    return ok(`Bergabung dengan ${invite.workspace.name}.`, {
      workspaceName: invite.workspace.name,
    });
  });
}
