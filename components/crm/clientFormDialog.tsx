"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";

import { createClient, updateClient } from "@/app/actions/clients";
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
import { SelectField, TextAreaField, TextField } from "@/components/crm/formFields";

export type ClientFormValue = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  status: string;
};

const emptyClient: ClientFormValue = {
  name: "",
  email: "",
  phone: "",
  address: "",
  taxId: "",
  status: "PROSPECT",
};

export function ClientFormDialog({
  client,
  trigger,
}: {
  client?: ClientFormValue;
  trigger: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<ClientFormValue>(client ?? emptyClient);

  const update = (patch: Partial<ClientFormValue>) =>
    setForm((current) => ({ ...current, ...patch }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = client?.id
        ? await updateClient(client.id, form)
        : await createClient(form);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setOpen(false);
      if (!client?.id) setForm(emptyClient);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={client ? "sm" : "default"} variant={client ? "outline" : "default"}>
          {trigger}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{client ? "Ubah klien" : "Tambah klien"}</DialogTitle>
          <DialogDescription>
            Data klien dipakai untuk invoice, tugas, dan kontak PIC.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            id="client-name"
            label="Nama perusahaan / individu"
            value={form.name}
            onChange={(name) => update({ name })}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="client-email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(email) => update({ email })}
            />
            <TextField
              id="client-phone"
              label="Telepon"
              value={form.phone}
              onChange={(phone) => update({ phone })}
            />
          </div>
          <TextField
            id="client-tax"
            label="NPWP / ID pajak"
            value={form.taxId}
            onChange={(taxId) => update({ taxId })}
          />
          <TextAreaField
            id="client-address"
            label="Alamat"
            value={form.address}
            onChange={(address) => update({ address })}
          />
          <SelectField
            id="client-status"
            label="Status"
            value={form.status}
            onChange={(status) => update({ status })}
            options={[
              { value: "PROSPECT", label: "Prospek" },
              { value: "ACTIVE", label: "Aktif" },
              { value: "INACTIVE", label: "Tidak Aktif" },
            ]}
          />
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
