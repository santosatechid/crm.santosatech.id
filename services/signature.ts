import "server-only";

import { prisma } from "@/services/prisma";
import { hashToken } from "@/lib/token";

export async function getSignatureByToken(token: string) {
  if (!token) return null;
  const request = await prisma.signatureRequest.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      invoice: {
        include: {
          client: true,
          items: { orderBy: { sortOrder: "asc" } },
          payments: { orderBy: { paidAt: "asc" } },
          workspace: true,
        },
      },
    },
  });
  if (!request) return null;

  const expired =
    (request.status === "PENDING" || request.status === "VIEWED") &&
    request.expiresAt.getTime() < Date.now();

  return { ...request, expired };
}
