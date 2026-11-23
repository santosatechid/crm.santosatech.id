"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { prisma } from "@/services/prisma";
import { clientIp, requireWorkspaceAction } from "@/services/auth/session";
import { sendEmail } from "@/services/email";
import { getSignatureByToken } from "@/services/signature";
import { parseInput, signSchema, signatureRequestSchema } from "@/lib/validation";
import { runAction } from "@/lib/action";
import { fail, ok, type ActionResult } from "@/lib/result";
import { resolveInvoiceStatus, SIGNATURE_ELIGIBLE_STATUSES } from "@/lib/invoice";
import { createSigningToken, hashToken, sha256 } from "@/lib/token";
import { formatIDR } from "@/lib/format";

const BILLING: Array<"OWNER" | "ADMIN"> = ["OWNER", "ADMIN"];

function appUrl(): string {
  return process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
}

export async function createSignatureRequest(
  input: unknown,
): Promise<ActionResult<{ url: string; expiresAt: string; emailSent: boolean; reason?: string }>> {
  return runAction(async () => {
    const { workspace, user } = await requireWorkspaceAction(BILLING);
    const parsed = parseInput(signatureRequestSchema, input);
    if (!parsed.ok) return fail(parsed.message);

    const invoice = await prisma.invoice.findFirst({
      where: { id: parsed.data.invoiceId, workspaceId: workspace.id },
      include: { client: true },
    });
    if (!invoice) throw new Error("Invoice tidak ditemukan.");

    const status = resolveInvoiceStatus(invoice.status, invoice.dueDate);
    if (!SIGNATURE_ELIGIBLE_STATUSES.includes(status)) {
      throw new Error("Invoice harus dikirim terlebih dahulu sebelum minta tanda tangan.");
    }

    const token = createSigningToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const url = `${appUrl()}/sign/${token}`;

    await prisma.$transaction(async (tx) => {
      await tx.signatureRequest.updateMany({
        where: {
          invoiceId: invoice.id,
          status: { in: ["PENDING", "VIEWED"] },
        },
        data: { status: "REVOKED" },
      });
      await tx.signatureRequest.create({
        data: {
          invoiceId: invoice.id,
          tokenHash: hashToken(token),
          expiresAt,
          createdById: user.id,
        },
      });
      await tx.activityLog.create({
        data: {
          workspaceId: workspace.id,
          actorId: user.id,
          action: "signature.requested",
          entityType: "Invoice",
          entityId: invoice.id,
          metadata: { number: invoice.number, expiresAt: expiresAt.toISOString() },
        },
      });
    });

    const emailResult = invoice.client.email
      ? await sendEmail({
          to: invoice.client.email,
          subject: `Tanda tangan invoice ${invoice.number}`,
          html: `<p>Halo ${invoice.client.name},</p><p>Silakan periksa dan tanda tangani invoice ${invoice.number} sebesar <strong>${formatIDR(invoice.total)}</strong> melalui tautan berikut:</p><p><a href="${url}">${url}</a></p><p>Tautan berlaku sampai ${expiresAt.toLocaleDateString("id-ID")}.</p>`,
        })
      : { sent: false, reason: "Klien belum punya email; bagikan tautan secara manual." };

    revalidatePath(`/dashboard/invoices/${invoice.id}`);
    return ok("Link tanda tangan dibuat.", {
      url,
      expiresAt: expiresAt.toISOString(),
      emailSent: emailResult.sent,
      reason: emailResult.reason,
    });
  });
}

export async function revokeSignatureRequest(requestId: string): Promise<ActionResult> {
  return runAction(async () => {
    const { workspace, user } = await requireWorkspaceAction(BILLING);
    const request = await prisma.signatureRequest.findFirst({
      where: { id: requestId, invoice: { workspaceId: workspace.id } },
      select: { id: true, invoiceId: true, status: true },
    });
    if (!request) throw new Error("Permintaan tanda tangan tidak ditemukan.");
    if (request.status !== "PENDING" && request.status !== "VIEWED") {
      throw new Error("Link ini tidak bisa dicabut.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.signatureRequest.update({
        where: { id: request.id },
        data: { status: "REVOKED" },
      });
      await tx.activityLog.create({
        data: {
          workspaceId: workspace.id,
          actorId: user.id,
          action: "signature.revoked",
          entityType: "Invoice",
          entityId: request.invoiceId,
        },
      });
    });

    revalidatePath(`/dashboard/invoices/${request.invoiceId}`);
    return ok("Link tanda tangan dicabut.");
  });
}

export async function markSignatureViewed(token: string): Promise<void> {
  const request = await getSignatureByToken(token);
  if (!request || request.status !== "PENDING" || request.expired) return;

  const headerList = await headers();
  await prisma.signatureRequest.update({
    where: { id: request.id },
    data: {
      status: "VIEWED",
      viewedAt: new Date(),
      signerIp: clientIp(headerList),
      signerUserAgent: headerList.get("user-agent"),
    },
  });
}

export async function submitSignature(
  token: string,
  input: unknown,
): Promise<ActionResult<{ invoiceId: string }>> {
  return runAction(async () => {
    const parsed = parseInput(signSchema, input);
    if (!parsed.ok) return fail(parsed.message);

    const request = await getSignatureByToken(token);
    if (!request) throw new Error("Link tanda tangan tidak ditemukan.");
    if (request.expired) throw new Error("Link tanda tangan sudah kedaluwarsa.");
    if (request.status !== "PENDING" && request.status !== "VIEWED") {
      throw new Error("Link tanda tangan tidak aktif.");
    }

    const headerList = await headers();
    const signedAt = new Date();
    const documentHash = sha256(
      [
        request.invoice.id,
        request.invoice.number,
        String(request.invoice.total),
        parsed.data.name,
        signedAt.toISOString(),
        sha256(parsed.data.signature),
      ].join("|"),
    );

    await prisma.$transaction(async (tx) => {
      await tx.signatureRequest.update({
        where: { id: request.id },
        data: {
          status: "SIGNED",
          signerName: parsed.data.name,
          signerEmail: parsed.data.email,
          signerIp: clientIp(headerList),
          signerUserAgent: headerList.get("user-agent"),
          signedAt,
          signatureImageUrl: parsed.data.signature,
          signedPdfHash: documentHash,
        },
      });
      await tx.activityLog.create({
        data: {
          workspaceId: request.invoice.workspaceId,
          actorId: null,
          action: "signature.signed",
          entityType: "Invoice",
          entityId: request.invoice.id,
          metadata: {
            number: request.invoice.number,
            signerName: parsed.data.name,
            hash: documentHash,
          },
        },
      });
    });

    revalidatePath(`/dashboard/invoices/${request.invoice.id}`);
    revalidatePath(`/sign/${token}`);
    return ok("Invoice berhasil ditandatangani.", { invoiceId: request.invoice.id });
  });
}
