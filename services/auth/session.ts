import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/services/auth/auth";
import { prisma } from "@/services/prisma";
import type {
  Membership,
  Workspace,
} from "@/prisma/generated/client";
import type { WorkspaceRole } from "@/prisma/generated/enums";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type WorkspaceSession = {
  user: AuthUser;
  membership: Membership;
  workspace: Workspace;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

async function findMembership(userId: string) {
  return prisma.membership.findFirst({
    where: { userId },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getWorkspaceSession(): Promise<WorkspaceSession | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const membership = await findMembership(user.id);
  if (!membership) return null;
  return { user, membership, workspace: membership.workspace };
}

/** Server-component guard: redirects instead of throwing. */
export async function requireWorkspace(
  roles?: WorkspaceRole[],
): Promise<WorkspaceSession> {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signIn");

  const membership = await findMembership(user.id);
  if (!membership) redirect("/onboarding");

  if (roles && !roles.includes(membership.role)) redirect("/dashboard");

  return { user, membership, workspace: membership.workspace };
}

/** Server-action guard: throws so the caller can surface the message. */
export async function requireWorkspaceAction(
  roles?: WorkspaceRole[],
): Promise<WorkspaceSession> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sesi tidak ditemukan. Silakan masuk ulang.");

  const membership = await findMembership(user.id);
  if (!membership) throw new Error("Workspace tidak ditemukan.");

  if (roles && !roles.includes(membership.role)) {
    throw new Error("Anda tidak punya akses untuk aksi ini.");
  }

  return { user, membership, workspace: membership.workspace };
}

export function clientIp(headersList: Headers): string | null {
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    null
  );
}
