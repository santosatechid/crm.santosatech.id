"use client";

import { Suspense, type FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EntryField,
  EntryFooter,
  EntryForm,
  EntryGroup,
  EntryHeading,
  EntryLink,
  EntryScreen,
} from "@/components/entry/Entry";
import { emailOtp } from "@/services/auth/authClients";

function VerifyOtpForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      toast.error("Kode verifikasi terdiri dari 6 angka.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await emailOtp.verifyEmail({ email, otp: otp.trim() });
      if (error) {
        toast.error(error.message || "Kode verifikasi salah atau kedaluwarsa.");
        return;
      }
      toast.success("Email terverifikasi. Mengarahkan...");
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan verifikasi";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      const { error } = await emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      if (error) {
        toast.error(error.message || "Gagal mengirim ulang kode.");
        return;
      }
      setCooldown(60);
      toast.success("Kode baru dikirim ke email Anda.");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan pengiriman";
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <EntryForm>
        <EntryHeading
          title="Periksa OTP"
          description="Alamat email tidak ditemukan. Ulangi pendaftaran untuk menerima kode."
        />
        <EntryFooter delay="animate-delay-300">
          <EntryLink href="/auth/signUp">Kembali ke pendaftaran</EntryLink>
        </EntryFooter>
      </EntryForm>
    );
  }

  return (
    <EntryForm>
      <EntryHeading
        title="Periksa OTP"
        description={`Masukkan kode 6 angka yang kami kirim ke ${email}. Kode berlaku 10 menit.`}
      />

      <form onSubmit={handleVerify} className="flex flex-col gap-6">
        <EntryGroup
          label="Kode verifikasi"
          delay="animate-element animate-delay-300"
        >
          <EntryField label="Kode OTP" htmlFor="otp">
            <Input
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="••••••"
              className="text-center text-[22px] tracking-[0.5em]"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
          </EntryField>
        </EntryGroup>

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="animate-element animate-delay-400 w-full"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Memeriksa...
            </>
          ) : (
            "Verifikasi"
          )}
        </Button>
      </form>

      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={resending || cooldown > 0}
        onClick={handleResend}
        className="animate-element animate-delay-500 w-full"
      >
        {resending
          ? "Mengirim..."
          : cooldown > 0
            ? `Kirim ulang dalam ${cooldown}s`
            : "Kirim ulang kode"}
      </Button>

      <EntryFooter delay="animate-delay-600">
        Sudah punya akun? <EntryLink href="/auth/signIn">Masuk</EntryLink>
      </EntryFooter>
    </EntryForm>
  );
}

export default function VerifyOtp() {
  return (
    <EntryScreen>
      <Suspense>
        <VerifyOtpForm />
      </Suspense>
    </EntryScreen>
  );
}
