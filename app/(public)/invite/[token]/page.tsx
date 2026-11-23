import Link from "next/link";

import { AcceptInviteButton } from "@/components/crm/acceptInviteButton";
import { ROLE_LABEL } from "@/lib/permissions";
import { hashToken } from "@/lib/token";
import { getCurrentUser } from "@/services/auth/session";
import { prisma } from "@/services/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [invite, user] = await Promise.all([
    prisma.workspaceInvite.findUnique({
      where: { token: hashToken(token) },
      include: { workspace: { select: { name: true } } },
    }),
    getCurrentUser(),
  ]);

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4 rounded-xl border p-6">
        <h1 className="text-xl font-semibold">Undangan workspace</h1>

        {!invite ? (
          <p className="text-muted-foreground text-sm">Undangan tidak ditemukan.</p>
        ) : invite.acceptedAt ? (
          <p className="text-muted-foreground text-sm">
            Undangan ini sudah digunakan.
          </p>
        ) : invite.expiresAt.getTime() < Date.now() ? (
          <p className="text-muted-foreground text-sm">Undangan sudah kedaluwarsa.</p>
        ) : (
          <>
            <p className="text-sm">
              Anda diundang bergabung dengan <strong>{invite.workspace.name}</strong>{" "}
              sebagai {ROLE_LABEL[invite.role]}.
            </p>
            {!user ? (
              <Link
                href={`/auth/signIn?next=${encodeURIComponent(`/invite/${token}`)}`}
                className="text-sm font-medium underline underline-offset-4"
              >
                Masuk atau daftar dulu untuk menerima undangan
              </Link>
            ) : user.email.toLowerCase() !== invite.email.toLowerCase() ? (
              <p className="text-sm text-destructive">
                Undangan ditujukan untuk {invite.email}, sedangkan Anda masuk sebagai{" "}
                {user.email}.
              </p>
            ) : (
              <AcceptInviteButton token={token} />
            )}
          </>
        )}
      </div>
    </main>
  );
}
