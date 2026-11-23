"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateProfile } from "@/app/actions/workspace";
import { TextField } from "@/components/crm/formFields";
import { Button } from "@/components/ui/button";

export function ProfileForm({
  initial,
}: {
  initial: { name: string; phone: string };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateProfile(form);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <TextField
        id="profile-name"
        label="Nama"
        value={form.name}
        onChange={(name) => setForm((current) => ({ ...current, name }))}
        required
      />
      <TextField
        id="profile-phone"
        label="Telepon"
        value={form.phone}
        onChange={(phone) => setForm((current) => ({ ...current, phone }))}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Menyimpan..." : "Simpan profil"}
      </Button>
    </form>
  );
}
