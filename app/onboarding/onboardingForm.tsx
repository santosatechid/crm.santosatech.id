"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { createWorkspace } from "@/app/actions/workspace";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function OnboardingForm({
  defaultName,
  defaultEmail,
}: {
  defaultName: string;
  defaultEmail: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: defaultName ? `Kantor ${defaultName}` : "",
    email: defaultEmail,
    phone: "",
    address: "",
  });

  const update = (patch: Partial<typeof form>) =>
    setForm((current) => ({ ...current, ...patch }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await createWorkspace(form);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Buat workspace kantor</CardTitle>
        <CardDescription>
          Workspace adalah ruang kerja satu kantor. Data klien, invoice, dan tugas
          tersimpan di dalamnya.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama kantor</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(event) => update({ name: event.target.value })}
              placeholder="Contoh: Santosa Studio"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email kantor</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => update({ email: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telepon</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(event) => update({ phone: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Textarea
              id="address"
              value={form.address}
              onChange={(event) => update({ address: event.target.value })}
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Membuat workspace..." : "Buat workspace"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
