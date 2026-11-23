"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/services/prisma";
import {
  getCurrentUser,
  requireWorkspaceAction,
} from "@/services/auth/session";
import {
  onboardingSchema,
  parseInput,
  profileSchema,
  workspaceSchema,
} from "@/lib/validation";
import { runAction } from "@/lib/action";
import { fail, ok, type ActionResult } from "@/lib/result";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function createWorkspace(input: unknown): Promise<ActionResult<{ slug: string }>> {
  return runAction(async () => {
    const user = await getCurrentUser();
    if (!user) throw new Error("Sesi tidak ditemukan. Silakan masuk ulang.");

    const parsed = parseInput(onboardingSchema, input);
    if (!parsed.ok) return fail(parsed.message);

    const existing = await prisma.membership.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    if (existing) throw new Error("Akun ini sudah memiliki workspace.");

    const workspace = await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: parsed.data.name,
          slug: `${slugify(parsed.data.name) || "kantor"}-${crypto.randomUUID().slice(0, 4)}`,
          email: parsed.data.email ?? user.email,
          phone: parsed.data.phone,
          address: parsed.data.address,
        },
      });
      await tx.membership.create({
        data: { userId: user.id, workspaceId: workspace.id, role: "OWNER" },
      });
      return workspace;
    });

    revalidatePath("/dashboard");
    return ok("Workspace berhasil dibuat.", { slug: workspace.slug });
  });
}

export async function updateWorkspace(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const { workspace } = await requireWorkspaceAction(["OWNER", "ADMIN"]);
    const parsed = parseInput(workspaceSchema, input);
    if (!parsed.ok) return fail(parsed.message);

    await prisma.workspace.update({
      where: { id: workspace.id },
      data: parsed.data,
    });
    revalidatePath("/dashboard/settings");
    return ok("Profil kantor diperbarui.");
  });
}

export async function updateProfile(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const { user } = await requireWorkspaceAction();
    const parsed = parseInput(profileSchema, input);
    if (!parsed.ok) return fail(parsed.message);

    await prisma.user.update({
      where: { id: user.id },
      data: { name: parsed.data.name, phone: parsed.data.phone },
    });
    revalidatePath("/dashboard/profile");
    return ok("Profil diperbarui.");
  });
}
