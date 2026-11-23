import Image from "next/image";

import { formatDate, formatIDR } from "@/lib/format";
import type { InvoiceStatus } from "@/prisma/generated/enums";
import { StatusBadge } from "@/components/crm/statusBadge";

export type InvoiceDocumentData = {
  workspace: {
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    logoUrl: string | null;
    bankName: string | null;
    bankAccountNumber: string | null;
    bankAccountName: string | null;
  };
  client: {
    name: string;
    address: string | null;
    email: string | null;
    phone: string | null;
    taxId: string | null;
  };
  invoice: {
    number: string;
    status: InvoiceStatus;
    issueDate: Date;
    dueDate: Date;
    subtotal: number;
    discount: number;
    taxRate: string;
    taxAmount: number;
    total: number;
    note: string | null;
  };
  items: Array<{
    id: string;
    description: string;
    quantity: string;
    unitPrice: number;
    amount: number;
  }>;
  signature?: {
    signerName: string | null;
    signedAt: Date | null;
    signatureImageUrl: string | null;
    signedPdfHash: string | null;
  } | null;
};

export function InvoiceDocument({
  workspace,
  client,
  invoice,
  items,
  signature,
}: InvoiceDocumentData) {
  return (
    <div className="space-y-6 rounded-xl border p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {workspace.logoUrl ? (
              <Image
                src={workspace.logoUrl}
                alt={workspace.name}
                width={40}
                height={40}
                unoptimized
                className="h-10 w-10 rounded object-contain"
              />
            ) : null}
            <p className="text-lg font-semibold">{workspace.name}</p>
          </div>
          <p className="text-muted-foreground text-sm whitespace-pre-line">
            {[workspace.address, workspace.phone, workspace.email]
              .filter(Boolean)
              .join("\n")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground text-xs uppercase">Invoice</p>
          <p className="text-xl font-semibold">{invoice.number}</p>
          <StatusBadge kind="invoice" value={invoice.status} />
        </div>
      </div>

      <div className="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-muted-foreground text-xs uppercase">Ditagihkan kepada</p>
          <p className="font-medium">{client.name}</p>
          <p className="text-muted-foreground whitespace-pre-line">
            {[client.address, client.email, client.phone, client.taxId]
              .filter(Boolean)
              .join("\n")}
          </p>
        </div>
        <div className="sm:text-right">
          <p>
            <span className="text-muted-foreground">Terbit: </span>
            {formatDate(invoice.issueDate)}
          </p>
          <p>
            <span className="text-muted-foreground">Jatuh tempo: </span>
            {formatDate(invoice.dueDate)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="p-2">Deskripsi</th>
              <th className="p-2 text-right">Jumlah</th>
              <th className="p-2 text-right">Harga</th>
              <th className="p-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.description}</td>
                <td className="p-2 text-right">{item.quantity}</td>
                <td className="p-2 text-right">{formatIDR(item.unitPrice)}</td>
                <td className="p-2 text-right">{formatIDR(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatIDR(invoice.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Diskon</span>
          <span>-{formatIDR(invoice.discount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Pajak ({invoice.taxRate}%)</span>
          <span>{formatIDR(invoice.taxAmount)}</span>
        </div>
        <div className="flex justify-between border-t pt-1 text-base font-semibold">
          <span>Total</span>
          <span>{formatIDR(invoice.total)}</span>
        </div>
      </div>

      {invoice.note ? (
        <p className="text-muted-foreground text-sm whitespace-pre-line">
          {invoice.note}
        </p>
      ) : null}

      {workspace.bankAccountNumber ? (
        <div className="rounded-lg border p-3 text-sm">
          <p className="font-medium">Pembayaran</p>
          <p className="text-muted-foreground">
            {[workspace.bankName, workspace.bankAccountNumber, workspace.bankAccountName]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      ) : null}

      {signature ? (
        <div className="flex flex-wrap items-end justify-between gap-4 border-t pt-4">
          <div className="text-xs text-muted-foreground">
            <p>Ditandatangani oleh</p>
            <p className="text-foreground text-sm font-medium">
              {signature.signerName ?? "—"}
            </p>
            <p>{formatDate(signature.signedAt)}</p>
            {signature.signedPdfHash ? (
              <p className="max-w-xs truncate font-mono">
                SHA-256: {signature.signedPdfHash}
              </p>
            ) : null}
          </div>
          {signature.signatureImageUrl ? (
            <Image
              src={signature.signatureImageUrl}
              alt="Tanda tangan"
              width={180}
              height={80}
              unoptimized
              className="h-20 w-44 object-contain"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
