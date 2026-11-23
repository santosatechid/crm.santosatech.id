"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createContact,
  deleteContact,
  updateContact,
} from "@/app/actions/clients";
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
import { TextField } from "@/components/crm/formFields";

export type ContactValue = {
  id?: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  isPrimary: boolean;
};

const emptyContact: ContactValue = {
  name: "",
  position: "",
  email: "",
  phone: "",
  isPrimary: false,
};

export function ContactDialog({
  clientId,
  contact,
  trigger,
}: {
  clientId: string;
  contact?: ContactValue;
  trigger: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<ContactValue>(contact ?? emptyContact);

  const update = (patch: Partial<ContactValue>) =>
    setForm((current) => ({ ...current, ...patch }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const payload = { ...form, clientId };
      const result = contact?.id
        ? await updateContact(contact.id, payload)
        : await createContact(payload);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setOpen(false);
      router.refresh();
    });
  };

  const handleDelete = () => {
    const contactId = contact?.id;
    if (!contactId) return;
    startTransition(async () => {
      const result = await deleteContact(contactId);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={contact ? "sm" : "default"} variant={contact ? "outline" : "default"}>
          {trigger}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{contact ? "Ubah kontak" : "Tambah kontak PIC"}</DialogTitle>
          <DialogDescription>
            Satu kontak dapat ditandai sebagai kontak utama klien.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            id="contact-name"
            label="Nama"
            value={form.name}
            onChange={(name) => update({ name })}
            required
          />
          <TextField
            id="contact-position"
            label="Jabatan"
            value={form.position}
            onChange={(position) => update({ position })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="contact-email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(email) => update({ email })}
            />
            <TextField
              id="contact-phone"
              label="Telepon"
              value={form.phone}
              onChange={(phone) => update({ phone })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPrimary}
              onChange={(event) => update({ isPrimary: event.target.checked })}
            />
            Jadikan kontak utama
          </label>
          <DialogFooter className="gap-2 sm:justify-between">
            {contact ? (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={pending}
              >
                Hapus
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
