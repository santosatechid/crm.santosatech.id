"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { addPayment, cancelInvoice, sendInvoice } from "@/app/actions/invoices";
import {
  createSignatureRequest,
  revokeSignatureRequest,
} from "@/app/actions/signatures";
import { ConfirmAction } from "@/components/crm/confirmAction";
import { SelectField, TextAreaField, TextField } from "@/components/crm/formFields";
import { StatusBadge } from "@/components/crm/statusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { dateInputValue, formatDateTime, formatIDR } from "@/lib/format";

export type InvoiceSignature = {
  id: string;
  status: string;
  createdAt: Date;
  expiresAt: Date;
  signedAt: Date | null;
  signerName: string | null;
};

export type InvoiceActionsProps = {
  invoice: {
    id: string;
    number: string;
    status: string;
    total: number;
    paid: number;
  };
  signatures: InvoiceSignature[];
  canManage: boolean;
};

export function InvoiceActions({ invoice, signatures, canManage }: InvoiceActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [signatureLink, setSignatureLink] = useState<string | null>(null);
  const [signatureNote, setSignatureNote] = useState<string | null>(null);
  const [payment, setPayment] = useState({
    amount: String(Math.max(invoice.total - invoice.paid, 0)),
    paidAt: dateInputValue(new Date()),
    method: "TRANSFER",
    note: "",
  });

  const remaining = Math.max(invoice.total - invoice.paid, 0);

  const openPaymentDialog = (open: boolean) => {
    setPaymentOpen(open);
    if (open) {
      setPayment((current) => ({ ...current, amount: String(remaining) }));
    }
  };
  const canSend = invoice.status === "DRAFT";
  const canCancel = ["DRAFT", "SENT", "PARTIALLY_PAID", "OVERDUE"].includes(invoice.status);
  const canPay = ["SENT", "PARTIALLY_PAID", "OVERDUE"].includes(invoice.status);
  const canSign = ["SENT", "PARTIALLY_PAID", "OVERDUE", "PAID"].includes(invoice.status);
  const activeSignature = signatures.find(
    (signature) => signature.status === "PENDING" || signature.status === "VIEWED",
  );
  const latestSignature = signatures[0];

  const handleSend = () => {
    startTransition(async () => {
      const result = await sendInvoice(invoice.id);
      if (result.ok) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handlePayment = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await addPayment({
        invoiceId: invoice.id,
        amount: Number(payment.amount),
        paidAt: payment.paidAt,
        method: payment.method,
        note: payment.note,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setPaymentOpen(false);
      router.refresh();
    });
  };

  const handleSignature = () => {
    startTransition(async () => {
      const result = await createSignatureRequest({ invoiceId: invoice.id });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setSignatureLink(result.data.url);
      setSignatureNote(
        result.data.emailSent
          ? "Email berisi link sudah dikirim ke klien."
          : (result.data.reason ?? "Bagikan link ini secara manual."),
      );
      router.refresh();
    });
  };

  if (!canManage) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canSend ? (
        <Button onClick={handleSend} disabled={pending} size="sm">
          {pending ? "Memproses..." : "Kirim invoice"}
        </Button>
      ) : null}

      {canPay ? (
        <Dialog open={paymentOpen} onOpenChange={openPaymentDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" disabled={pending}>
              Catat pembayaran
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Catat pembayaran</DialogTitle>
              <DialogDescription>
                Sisa tagihan saat ini {formatIDR(remaining)}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePayment} className="space-y-4">
              <TextField
                id="payment-amount"
                label="Nominal (Rp)"
                type="number"
                value={payment.amount}
                onChange={(amount) => setPayment((current) => ({ ...current, amount }))}
                required
              />
              <TextField
                id="payment-date"
                label="Tanggal bayar"
                type="date"
                value={payment.paidAt}
                onChange={(paidAt) => setPayment((current) => ({ ...current, paidAt }))}
                required
              />
              <SelectField
                id="payment-method"
                label="Metode"
                value={payment.method}
                onChange={(method) => setPayment((current) => ({ ...current, method }))}
                options={[
                  { value: "TRANSFER", label: "Transfer" },
                  { value: "CASH", label: "Tunai" },
                  { value: "OTHER", label: "Lainnya" },
                ]}
              />
              <TextAreaField
                id="payment-note"
                label="Catatan"
                value={payment.note}
                onChange={(note) => setPayment((current) => ({ ...current, note }))}
              />
              <DialogFooter>
                <Button type="submit" disabled={pending}>
                  {pending ? "Menyimpan..." : "Simpan pembayaran"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}

      {canSign ? (
        <Dialog
          open={signatureOpen}
          onOpenChange={(open) => {
            setSignatureOpen(open);
            if (!open) {
              setSignatureLink(null);
              setSignatureNote(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" disabled={pending}>
              Minta tanda tangan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tanda tangan via link</DialogTitle>
              <DialogDescription>
                Klien menandatangani tanpa akun. Link lama otomatis dicabut saat link
                baru dibuat.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {latestSignature ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Link terakhir:</span>
                  <StatusBadge kind="signature" value={latestSignature.status} />
                  <span className="text-muted-foreground text-xs">
                    {formatDateTime(latestSignature.signedAt ?? latestSignature.createdAt)}
                  </span>
                </div>
              ) : null}

              {signatureLink ? (
                <div className="space-y-2 rounded-lg border p-3">
                  <p className="text-sm font-medium">Link siap dibagikan</p>
                  <code className="block truncate rounded bg-muted px-2 py-1 text-xs">
                    {signatureLink}
                  </code>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await navigator.clipboard.writeText(signatureLink);
                      toast.success("Link disalin.");
                    }}
                  >
                    <Copy className="mr-1 h-4 w-4" /> Salin link
                  </Button>
                  {signatureNote ? (
                    <p className="text-muted-foreground text-xs">{signatureNote}</p>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={handleSignature} disabled={pending}>
                  {pending ? "Membuat..." : "Buat link baru"}
                </Button>
                {activeSignature ? (
                  <ConfirmAction
                    trigger="Cabut link"
                    title="Cabut link tanda tangan?"
                    description="Link yang sudah dicabut tidak dapat dipakai lagi."
                    confirmLabel="Cabut"
                    destructive
                    onConfirm={() => revokeSignatureRequest(activeSignature.id)}
                  />
                ) : null}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}

      {canCancel ? (
        <ConfirmAction
          trigger="Batalkan"
          title="Batalkan invoice?"
          description="Invoice dibatalkan dan tidak dapat dipakai lagi. Buat invoice baru untuk koreksi."
          confirmLabel="Batalkan invoice"
          destructive
          onConfirm={() => cancelInvoice(invoice.id)}
        />
      ) : null}
    </div>
  );
}
