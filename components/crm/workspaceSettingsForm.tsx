"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateWorkspace } from "@/app/actions/workspace";
import { TextAreaField, TextField } from "@/components/crm/formFields";
import { Button } from "@/components/ui/button";

export type WorkspaceFormValue = {
  name: string;
  email: string;
  phone: string;
  address: string;
  logoUrl: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  invoiceNumberFormat: string;
  defaultTaxRate: string;
};

export function WorkspaceSettingsForm({
  initial,
}: {
  initial: WorkspaceFormValue;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);

  const update = (patch: Partial<WorkspaceFormValue>) =>
    setForm((current) => ({ ...current, ...patch }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateWorkspace({
        ...form,
        defaultTaxRate: Number(form.defaultTaxRate) || 0,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          id="workspace-name"
          label="Nama kantor"
          value={form.name}
          onChange={(name) => update({ name })}
          required
        />
        <TextField
          id="workspace-email"
          label="Email kantor"
          type="email"
          value={form.email}
          onChange={(email) => update({ email })}
        />
        <TextField
          id="workspace-phone"
          label="Telepon"
          value={form.phone}
          onChange={(phone) => update({ phone })}
        />
        <TextField
          id="workspace-logo"
          label="URL logo"
          value={form.logoUrl}
          onChange={(logoUrl) => update({ logoUrl })}
        />
      </div>
      <TextAreaField
        id="workspace-address"
        label="Alamat"
        value={form.address}
        onChange={(address) => update({ address })}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <TextField
          id="workspace-bank-name"
          label="Nama bank"
          value={form.bankName}
          onChange={(bankName) => update({ bankName })}
        />
        <TextField
          id="workspace-bank-number"
          label="Nomor rekening"
          value={form.bankAccountNumber}
          onChange={(bankAccountNumber) => update({ bankAccountNumber })}
        />
        <TextField
          id="workspace-bank-owner"
          label="Atas nama"
          value={form.bankAccountName}
          onChange={(bankAccountName) => update({ bankAccountName })}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          id="workspace-invoice-format"
          label="Format nomor invoice"
          value={form.invoiceNumberFormat}
          onChange={(invoiceNumberFormat) => update({ invoiceNumberFormat })}
          placeholder="INV-{YYYY}-{SEQ:4}"
        />
        <TextField
          id="workspace-tax"
          label="Pajak default (%)"
          type="number"
          value={form.defaultTaxRate}
          onChange={(defaultTaxRate) => update({ defaultTaxRate })}
        />
      </div>
      <p className="text-muted-foreground text-xs">
        Token format: {"{YYYY}"}, {"{YY}"}, {"{MM}"}, {"{SEQ}"} atau {"{SEQ:4}"}.
      </p>
      <Button type="submit" disabled={pending}>
        {pending ? "Menyimpan..." : "Simpan profil kantor"}
      </Button>
    </form>
  );
}
