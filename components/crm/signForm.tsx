"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { markSignatureViewed, submitSignature } from "@/app/actions/signatures";
import { TextField } from "@/components/crm/formFields";
import { Button } from "@/components/ui/button";

export function SignForm({
  token,
  defaultName,
  defaultEmail,
}: {
  token: string;
  defaultName: string;
  defaultEmail: string;
}) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [consent, setConsent] = useState(false);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    void markSignatureViewed(token);
  }, [token]);

  const position = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    drawing.current = true;
    const point = position(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    const point = position(event);
    context.lineWidth = 2.5;
    context.lineCap = "round";
    context.strokeStyle = "#111827";
    context.lineTo(point.x, point.y);
    context.stroke();
    setHasInk(true);
  };

  const stop = () => {
    drawing.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !hasInk) {
      toast.error("Gambar tanda tangan terlebih dahulu.");
      return;
    }

    startTransition(async () => {
      const result = await submitSignature(token, {
        name,
        email,
        signature: canvas.toDataURL("image/png"),
        consent,
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
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="sign-name"
          label="Nama penanda tangan"
          value={name}
          onChange={setName}
          required
        />
        <TextField
          id="sign-email"
          label="Email (opsional)"
          type="email"
          value={email}
          onChange={setEmail}
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Tanda tangan</p>
        <canvas
          ref={canvasRef}
          width={640}
          height={200}
          className="bg-background h-40 w-full touch-none rounded-lg border"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={stop}
          onPointerLeave={stop}
        />
        <Button type="button" variant="outline" size="sm" onClick={clear}>
          Hapus tanda tangan
        </Button>
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5"
        />
        <span>
          Saya menyatakan telah memeriksa invoice ini dan menyetujuinya. Tanda tangan
          elektronik ini dicatat beserta waktu, alamat IP, dan hash dokumen.
        </span>
      </label>

      <Button type="submit" disabled={pending || !consent}>
        {pending ? "Mengirim..." : "Kirim tanda tangan"}
      </Button>
    </form>
  );
}
