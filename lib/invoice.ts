import type { InvoiceStatus } from "@/prisma/generated/enums";

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  SENT: "Terkirim",
  PARTIALLY_PAID: "Dibayar Sebagian",
  PAID: "Lunas",
  OVERDUE: "Jatuh Tempo",
  CANCELLED: "Dibatalkan",
};

export const OPEN_INVOICE_STATUSES: InvoiceStatus[] = [
  "SENT",
  "PARTIALLY_PAID",
];

export type InvoiceTotals = {
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
};

export type InvoiceItemInput = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export function computeTotals(
  items: InvoiceItemInput[],
  discount: number,
  taxRate: number,
): InvoiceTotals {
  const subtotal = items.reduce(
    (sum, item) => sum + Math.round(item.quantity * item.unitPrice),
    0,
  );
  const safeDiscount = Math.min(Math.max(discount, 0), subtotal);
  const taxable = subtotal - safeDiscount;
  const taxAmount = Math.round((taxable * Math.max(taxRate, 0)) / 100);
  return {
    subtotal,
    discount: safeDiscount,
    taxRate,
    taxAmount,
    total: taxable + taxAmount,
  };
}

export function formatInvoiceNumber(
  format: string,
  sequence: number,
  date: Date,
): string {
  const yyyy = String(date.getFullYear());
  return format
    .replaceAll("{YYYY}", yyyy)
    .replaceAll("{YY}", yyyy.slice(2))
    .replaceAll(
      "{MM}",
      String(date.getMonth() + 1).padStart(2, "0"),
    )
    .replace(/\{SEQ(?::(\d+))?\}/g, (_, width: string | undefined) =>
      String(sequence).padStart(Number(width ?? 4), "0"),
    );
}

/**
 * OVERDUE tidak pernah disimpan: diturunkan saat baca supaya tidak butuh cron.
 */
export function resolveInvoiceStatus(
  status: InvoiceStatus,
  dueDate: Date,
  now = new Date(),
): InvoiceStatus {
  if (
    OPEN_INVOICE_STATUSES.includes(status) &&
    dueDate.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  ) {
    return "OVERDUE";
  }
  return status;
}

export function paymentStatus(
  current: InvoiceStatus,
  total: number,
  paid: number,
): InvoiceStatus {
  if (paid >= total) return "PAID";
  if (paid > 0) return "PARTIALLY_PAID";
  if (current === "PAID" || current === "PARTIALLY_PAID") return "SENT";
  return current;
}

export const SIGNATURE_ELIGIBLE_STATUSES: InvoiceStatus[] = [
  "SENT",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
];
