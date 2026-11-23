"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { GoogleMark } from "@/components/entry/GoogleMark";
import {
  EntryDivider,
  EntryField,
  EntryFooter,
  EntryForm,
  EntryGroup,
  EntryHeading,
  EntryLink,
  EntryScreen,
} from "@/components/entry/Entry";
import { emailOtp, signIn, signUp } from "@/services/auth/authClients";
import { type FormEvent, useState } from "react";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nama lengkap wajib diisi.");
      return;
    }
    if (!email.trim()) {
      toast.error("Alamat email wajib diisi.");
      return;
    }
    if (password.length < 8) {
      toast.error("Kata sandi minimal 8 karakter.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await signUp.email({ email, password, name });

      if (error) {
        toast.error(error.message || "Gagal membuat akun. Silakan coba lagi.");
        return;
      }

      const { error: otpError } = await emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });

      if (otpError) {
        toast.error(
          otpError.message || "Gagal mengirim kode verifikasi ke email.",
        );
        return;
      }

      toast.success("Kode verifikasi dikirim ke email Anda.");
      router.push(`/auth/verifyOtp?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat pendaftaran";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      await signIn.social(
        {
          provider: "google",
          callbackURL: "/dashboard",
        },
        {
          onRequest: () => setLoading(true),
          onResponse: () => setLoading(false),
          onError: (ctx) => {
            setLoading(false);
            toast.error(
              ctx.error.message || "Gagal mendaftar dengan akun Google.",
            );
          },
        },
      );
    } catch (err: unknown) {
      setLoading(false);
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat pendaftaran Google";
      toast.error(message);
    }
  };

  return (
    <EntryScreen>
      <EntryForm>
        <EntryHeading
          title="Buat akun"
          description="Akun ini dipakai untuk masuk ke portal client. Data profil bisa dilengkapi setelah akun aktif."
        />

        <form onSubmit={handleSignUp} className="flex flex-col gap-6">
          <EntryGroup
            label="Identitas"
            delay="animate-element animate-delay-300"
          >
            <EntryField label="Nama lengkap" htmlFor="name">
              <Input
                id="name"
                placeholder="Ahmad Ramadhan"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </EntryField>

            <EntryField label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </EntryField>
          </EntryGroup>

          <EntryGroup
            label="Kata sandi"
            delay="animate-element animate-delay-400"
          >
            <EntryField label="Kata sandi (min. 8 karakter)" htmlFor="password">
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </EntryField>
          </EntryGroup>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="animate-element animate-delay-500 w-full"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Mendaftarkan...
              </>
            ) : (
              "Buat akun"
            )}
          </Button>
        </form>

        <EntryDivider label="atau lanjut dengan" />

        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={loading}
          onClick={handleGoogleSignUp}
          className="animate-element animate-delay-700 w-full"
        >
          <GoogleMark />
          Daftar dengan Google
        </Button>

        <EntryFooter>
          Sudah punya akun? <EntryLink href="/auth/signIn">Masuk</EntryLink>
        </EntryFooter>
      </EntryForm>
    </EntryScreen>
  );
}
