"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { createInvoice, updateInvoiceDraft } from "@/app/actions/invoices";
import { SelectField, TextAreaField, TextField } from "@/components/crm/formFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dateInputValue, formatIDR } from "@/lib/format";
import { computeTotals } from "@/lib/invoice";

export type InvoiceClientOption = { id: string; name: string };

export type InvoiceLineState = {
  description: string;
  quantity: string;
  unitPrice: string;
};

export type InvoiceFormInitial = {
  id?: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  discount: string;
  taxRate: string;
  note: string;
  items: InvoiceLineState[];
};

function defaultInitial(defaultTaxRate: number, clientId = ""): InvoiceFormInitial {
  const today = new Date();
  const due = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);
  return {
    clientId,
    issueDate: dateInputValue(today),
    dueDate: dateInputValue(due),
    discount: "0",
    taxRate: String(defaultTaxRate),
    note: "",
    items: [{ description: "", quantity: "1", unitPrice: "0" }],
  };
}

export function InvoiceForm({
  clients,
  defaultTaxRate,
  initial,
  backHref,
}: {
  clients: InvoiceClientOption[];
  defaultTaxRate: number;
  initial?: InvoiceFormInitial;
  backHref: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<InvoiceFormInitial>(
    initial ?? defaultInitial(defaultTaxRate),
  );

  const update = (patch: Partial<InvoiceFormInitial>) =>
    setForm((current) => ({ ...current, ...patch }));

  const updateItem = (index: number, patch: Partial<InvoiceLineState>) =>
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));

  const totals = computeTotals(
    form.items.map((item) => ({
      description: item.description,
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.unitPrice) || 0,
    })),
    Number(form.discount) || 0,
    Number(form.taxRate) || 0,
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const payload = {
        clientId: form.clientId,
        taskId: null,
        issueDate: form.issueDate,
        dueDate: form.dueDate,
        discount: Number(form.discount) || 0,
        taxRate: Number(form.taxRate) || 0,
        note: form.note,
        items: form.items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
        })),
      };
      if (form.id) {
        const result = await updateInvoiceDraft(form.id, payload);
        if (!result.ok) {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        router.push(`/dashboard/invoices/${form.id}`);
      } else {
        const result = await createInvoice(payload);
        if (!result.ok) {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        router.push(`/dashboard/invoices/${result.data.id}`);
      }
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SelectField
          id="invoice-client"
          label="Klien"
          value={form.clientId}
          onChange={(clientId) => update({ clientId })}
          options={clients.map((client) => ({ value: client.id, label: client.name }))}
        />
        <TextField
          id="invoice-issue"
          label="Tanggal terbit"
          type="date"
          value={form.issueDate}
          onChange={(issueDate) => update({ issueDate })}
          required
        />
        <TextField
          id="invoice-due"
          label="Jatuh tempo"
          type="date"
          value={form.dueDate}
          onChange={(dueDate) => update({ dueDate })}
          required
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Item invoice</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              update({
                items: [
                  ...form.items,
                  { description: "", quantity: "1", unitPrice: "0" },
                ],
              })
            }
          >
            <Plus className="mr-1 h-4 w-4" /> Tambah item
          </Button>
        </div>
        {form.items.map((item, index) => (
          <div key={index} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_100px_160px_40px]">
            <div className="space-y-1">
              <Label htmlFor={`item-desc-${index}`} className="text-xs">
                Deskripsi
              </Label>
              <Input
                id={`item-desc-${index}`}
                value={item.description}
                onChange={(event) =>
                  updateItem(index, { description: event.target.value })
                }
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`item-qty-${index}`} className="text-xs">
                Jumlah
              </Label>
              <Input
                id={`item-qty-${index}`}
                type="number"
                min="0.01"
                step="0.01"
                value={item.quantity}
                onChange={(event) =>
                  updateItem(index, { quantity: event.target.value })
                }
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`item-price-${index}`} className="text-xs">
                Harga satuan (Rp)
              </Label>
              <Input
                id={`item-price-${index}`}
                type="number"
                min="0"
                step="1"
                value={item.unitPrice}
                onChange={(event) =>
                  updateItem(index, { unitPrice: event.target.value })
                }
                required
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={form.items.length === 1}
                onClick={() =>
                  update({
                    items: form.items.filter((_, itemIndex) => itemIndex !== index),
                  })
                }
                aria-label="Hapus item"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <TextField
          id="invoice-discount"
          label="Diskon (Rp)"
          type="number"
          value={form.discount}
          onChange={(discount) => update({ discount })}
        />
        <TextField
          id="invoice-tax"
          label="Pajak (%)"
          type="number"
          value={form.taxRate}
          onChange={(taxRate) => update({ taxRate })}
        />
        <div className="space-y-1 rounded-lg border p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatIDR(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Diskon</span>
            <span>-{formatIDR(totals.discount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pajak</span>
            <span>{formatIDR(totals.taxAmount)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatIDR(totals.total)}</span>
          </div>
        </div>
      </div>

      <TextAreaField
        id="invoice-note"
        label="Catatan invoice"
        value={form.note}
        onChange={(note) => update({ note })}
        placeholder="Opsional: instruksi pembayaran, termin, dll."
      />

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : form.id ? "Simpan perubahan" : "Buat invoice"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(backHref)}
          disabled={pending}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
