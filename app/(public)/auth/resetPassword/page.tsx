"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/services/auth/authClients";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const token =
    typeof window === "undefined"
      ? ""
      : (new URLSearchParams(window.location.search).get("token") ?? "");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmation) {
      toast.error("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    if (!token) {
      toast.error("Token reset tidak ditemukan.");
      return;
    }
    setLoading(true);
    const { error } = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Gagal mengatur ulang kata sandi.");
      return;
    }
    toast.success("Kata sandi diperbarui. Silakan masuk.");
    router.push("/auth/signIn");
  };

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4 rounded-xl border p-6">
        <h1 className="text-xl font-semibold">Atur ulang kata sandi</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Kata sandi baru</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmation">Konfirmasi kata sandi</Label>
            <Input
              id="confirmation"
              type="password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              minLength={8}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan kata sandi"}
          </Button>
        </form>
        <Link
          href="/auth/signIn"
          className="text-muted-foreground text-sm underline-offset-4 hover:underline"
        >
          Kembali ke halaman masuk
        </Link>
      </div>
    </main>
  );
}
