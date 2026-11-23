import "server-only";

import type { Prisma } from "@/prisma/generated/client";

type ActivityInput = {
  workspaceId: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
};

export async function logActivity(
  tx: Prisma.TransactionClient,
  input: ActivityInput,
): Promise<void> {
  await tx.activityLog.create({
    data: {
      workspaceId: input.workspaceId,
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata,
    },
  });
}
