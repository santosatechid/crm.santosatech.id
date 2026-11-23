"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/services/prisma";
import { requireWorkspaceAction } from "@/services/auth/session";
import { sendEmail } from "@/services/email";
import { parseInput } from "@/lib/validation";
import { invoiceSchema, paymentSchema } from "@/lib/validation";
import { runAction } from "@/lib/action";
import { fail, ok, type ActionResult } from "@/lib/result";
import {
  computeTotals,
  formatInvoiceNumber,
  paymentStatus,
} from "@/lib/invoice";
import { dateInputValue, formatDate, formatIDR, parseDateInput } from "@/lib/format";

const BILLING: Array<"OWNER" | "ADMIN"> = ["OWNER", "ADMIN"];

export async function createInvoice(input: unknown): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const { workspace, user } = await requireWorkspaceAction(BILLING);
    const parsed = parseInput(invoiceSchema, input);
    if (!parsed.ok) return fail(parsed.message);
    const data = parsed.data;

    const client = await prisma.client.findFirst({
      where: { id: data.clientId, workspaceId: workspace.id, archivedAt: null },
      select: { id: true },
    });
    if (!client) throw new Error("Klien tidak ditemukan atau sudah diarsipkan.");

    if (data.taskId) {
      const task = await prisma.task.findFirst({
        where: { id: data.taskId, workspaceId: workspace.id },
        select: { id: true },
      });
      if (!task) throw new Error("Tugas tidak ditemukan.");
    }

    const issueDate = parseDateInput(data.issueDate);
    const dueDate = parseDateInput(data.dueDate);
    const totals = computeTotals(data.items, data.discount, data.taxRate);

    const invoice = await prisma.$transaction(async (tx) => {
      const sequence = await tx.workspace.update({
        where: { id: workspace.id },
        data: { invoiceNextNumber: { increment: 1 } },
        select: { invoiceNextNumber: true, invoiceNumberFormat: true },
      });
      const number = formatInvoiceNumber(
        sequence.invoiceNumberFormat,
        sequence.invoiceNextNumber - 1,
        issueDate,
      );

      const invoice = await tx.invoice.create({
        data: {
          workspaceId: workspace.id,
          clientId: data.clientId,
          taskId: data.taskId,
          number,
          issueDate,
          dueDate,
          subtotal: totals.subtotal,
          discount: totals.discount,
          taxRate: totals.taxRate,
          taxAmount: totals.taxAmount,
          total: totals.total,
          note: data.note,
          createdById: user.id,
          items: {
            create: data.items.map((item, index) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: Math.round(item.quantity * item.unitPrice),
              sortOrder: index,
            })),
          },
        },
        select: { id: true, number: true },
      });

      await tx.activityLog.create({
        data: {
          workspaceId: workspace.id,
          actorId: user.id,
          action: "invoice.created",
          entityType: "Invoice",
          entityId: invoice.id,
          metadata: { number: invoice.number, total: totals.total },
        },
      });

      return invoice;
    });

    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard");
    return ok(`Invoice ${invoice.number} dibuat.`, { id: invoice.id });
  });
}

export async function updateInvoiceDraft(
  invoiceId: string,
  input: unknown,
): Promise<ActionResult> {
  return runAction(async () => {
    const { workspace, user } = await requireWorkspaceAction(BILLING);
    const parsed = parseInput(invoiceSchema, input);
    if (!parsed.ok) return fail(parsed.message);
    const data = parsed.data;

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, workspaceId: workspace.id },
      select: { id: true, status: true, number: true },
    });
    if (!invoice) throw new Error("Invoice tidak ditemukan.");
    if (invoice.status !== "DRAFT") throw new Error("Invoice yang sudah dikirim tidak dapat diedit.");

    const client = await prisma.client.findFirst({
      where: { id: data.clientId, workspaceId: workspace.id, archivedAt: null },
      select: { id: true },
    });
    if (!client) throw new Error("Klien tidak ditemukan atau sudah diarsipkan.");

    const issueDate = parseDateInput(data.issueDate);
    const dueDate = parseDateInput(data.dueDate);
    const totals = computeTotals(data.items, data.discount, data.taxRate);

    await prisma.$transaction(async (tx) => {
      await tx.invoiceItem.deleteMany({ where: { invoiceId } });
      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          clientId: data.clientId,
          issueDate,
          dueDate,
          subtotal: totals.subtotal,
          discount: totals.discount,
          taxRate: totals.taxRate,
          taxAmount: totals.taxAmount,
          total: totals.total,
          note: data.note,
          items: {
            create: data.items.map((item, index) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: Math.round(item.quantity * item.unitPrice),
              sortOrder: index,
            })),
          },
        },
      });
      await tx.activityLog.create({
        data: {
          workspaceId: workspace.id,
          actorId: user.id,
          action: "invoice.updated",
          entityType: "Invoice",
          entityId: invoiceId,
          metadata: { number: invoice.number },
        },
      });
    });

    revalidatePath(`/dashboard/invoices/${invoiceId}`);
    revalidatePath("/dashboard/invoices");
    return ok("Invoice diperbarui.");
  });
}

export async function sendInvoice(invoiceId: string): Promise<ActionResult> {
  return runAction(async () => {
    const { workspace, user } = await requireWorkspaceAction(BILLING);
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, workspaceId: workspace.id },
      include: { client: true },
    });
    if (!invoice) throw new Error("Invoice tidak ditemukan.");
    if (invoice.status !== "DRAFT") throw new Error("Hanya invoice Draft yang dapat dikirim.");

    const emailResult = invoice.client.email
      ? await sendEmail({
          to: invoice.client.email,
          subject: `Invoice ${invoice.number} dari ${workspace.name}`,
          html: [
            `<p>Halo ${invoice.client.name},</p>`,
            `<p>Berikut invoice ${invoice.number} dengan total <strong>${formatIDR(invoice.total)}</strong> dan jatuh tempo ${formatDate(invoice.dueDate)}.</p>`,
            `<p>${invoice.note ?? ""}</p>`,
            `<p>Terima kasih,<br/>${workspace.name}</p>`,
          ].join(""),
        })
      : { sent: false, reason: "Klien belum punya email." };

    await prisma.$transaction(async (tx) => {
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: "SENT", sentAt: new Date() },
      });
      await tx.activityLog.create({
        data: {
          workspaceId: workspace.id,
          actorId: user.id,
          action: "invoice.sent",
          entityType: "Invoice",
          entityId: invoiceId,
          metadata: { number: invoice.number, emailSent: emailResult.sent },
        },
      });
    });

    revalidatePath(`/dashboard/invoices/${invoiceId}`);
    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard");
    return ok(
      emailResult.sent
        ? `Invoice ${invoice.number} ditandai terkirim dan email terkirim ke ${invoice.client.email}.`
        : `Invoice ${invoice.number} ditandai terkirim. ${emailResult.reason ?? ""}`.trim(),
    );
  });
}

export async function cancelInvoice(invoiceId: string): Promise<ActionResult> {
  return runAction(async () => {
    const { workspace, user } = await requireWorkspaceAction(BILLING);
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, workspaceId: workspace.id },
      select: { id: true, status: true, number: true },
    });
    if (!invoice) throw new Error("Invoice tidak ditemukan.");
    if (invoice.status === "PAID") throw new Error("Invoice lunas tidak dapat dibatalkan.");
    if (invoice.status === "CANCELLED") throw new Error("Invoice sudah dibatalkan.");

    await prisma.$transaction(async (tx) => {
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      });
      await tx.signatureRequest.updateMany({
        where: { invoiceId, status: { in: ["PENDING", "VIEWED"] } },
        data: { status: "REVOKED" },
      });
      await tx.activityLog.create({
        data: {
          workspaceId: workspace.id,
          actorId: user.id,
          action: "invoice.cancelled",
          entityType: "Invoice",
          entityId: invoiceId,
          metadata: { number: invoice.number },
        },
      });
    });

    revalidatePath(`/dashboard/invoices/${invoiceId}`);
    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard");
    return ok(`Invoice ${invoice.number} dibatalkan.`);
  });
}

export async function addPayment(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const { workspace, user } = await requireWorkspaceAction(BILLING);
    const parsed = parseInput(paymentSchema, input);
    if (!parsed.ok) return fail(parsed.message);
    const data = parsed.data;

    const invoice = await prisma.invoice.findFirst({
      where: { id: data.invoiceId, workspaceId: workspace.id },
      include: { payments: { select: { amount: true } } },
    });
    if (!invoice) throw new Error("Invoice tidak ditemukan.");
    if (invoice.status === "DRAFT") throw new Error("Kirim invoice terlebih dahulu sebelum mencatat pembayaran.");
    if (invoice.status === "CANCELLED") throw new Error("Invoice dibatalkan.");
    if (invoice.status === "PAID") throw new Error("Invoice sudah lunas.");

    const paid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const remaining = invoice.total - paid;
    if (data.amount > remaining) {
      throw new Error(`Nominal melebihi sisa tagihan (${formatIDR(remaining)}).`);
    }

    const nextStatus = paymentStatus(invoice.status, invoice.total, paid + data.amount);

    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: data.amount,
          paidAt: parseDateInput(data.paidAt),
          method: data.method,
          note: data.note,
          recordedById: user.id,
        },
      });
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status: nextStatus,
          paidAt: nextStatus === "PAID" ? new Date() : null,
        },
      });
      await tx.activityLog.create({
        data: {
          workspaceId: workspace.id,
          actorId: user.id,
          action: "payment.recorded",
          entityType: "Invoice",
          entityId: invoice.id,
          metadata: { amount: data.amount, status: nextStatus },
        },
      });
    });

    revalidatePath(`/dashboard/invoices/${invoice.id}`);
    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard");
    return ok("Pembayaran dicatat.");
  });
}

export async function createInvoiceFromTask(
  taskId: string,
): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const { workspace } = await requireWorkspaceAction(BILLING);
    const task = await prisma.task.findFirst({
      where: { id: taskId, workspaceId: workspace.id },
      select: { id: true, title: true, description: true, clientId: true },
    });
    if (!task) throw new Error("Tugas tidak ditemukan.");
    if (!task.clientId) throw new Error("Tugas belum tertaut ke klien.");

    const today = new Date();
    const due = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);
    return createInvoice({
      clientId: task.clientId,
      taskId: task.id,
      issueDate: dateInputValue(today),
      dueDate: dateInputValue(due),
      discount: 0,
      taxRate: Number(workspace.defaultTaxRate),
      note: null,
      items: [
        {
          description: task.title,
          quantity: 1,
          unitPrice: 0,
        },
      ],
    });
  });
}
