"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/services/auth/authClients";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/auth/resetPassword",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Gagal mengirim email reset.");
      return;
    }
    setSent(true);
  };

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4 rounded-xl border p-6">
        <h1 className="text-xl font-semibold">Lupa kata sandi</h1>
        {sent ? (
          <p className="text-muted-foreground text-sm">
            Jika email terdaftar, tautan reset sudah dikirim. Periksa kotak masuk
            Anda.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Mengirim..." : "Kirim tautan reset"}
            </Button>
          </form>
        )}
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
