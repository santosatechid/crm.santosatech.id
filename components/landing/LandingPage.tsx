import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckSquare,
  FileSignature,
  FileText,
  Users,
} from "lucide-react";

import { DEFAULT_PLANS, formatPrice } from "@/lib/pricing";

const FEATURES = [
  {
    icon: Users,
    title: "CRM klien",
    body: "Data klien, banyak kontak PIC, status, dan timeline catatan dalam satu tempat.",
  },
  {
    icon: FileText,
    title: "Invoice cepat",
    body: "Nomor otomatis, pajak dan diskon, PDF siap cetak, serta pencatatan pembayaran sebagian.",
  },
  {
    icon: CheckSquare,
    title: "Tugas terhubung",
    body: "Papan Kanban, komentar, dan pembuatan invoice langsung dari tugas selesai.",
  },
  {
    icon: FileSignature,
    title: "Tanda tangan via link",
    body: "Klien menandatangani invoice tanpa akun. Setiap tanda tangan tercatat dengan bukti audit.",
  },
] as const;

export default function LandingPage() {
  const productName = process.env.NEXT_PUBLIC_CLIENT_NAME || "CRM Kantor";

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="border-border border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">{productName}</span>
          <nav className="flex items-center gap-3 text-sm">
            <a href="#fitur" className="text-muted-foreground hover:text-foreground">
              Fitur
            </a>
            <a href="#harga" className="text-muted-foreground hover:text-foreground">
              Harga
            </a>
            <Link
              href="/auth/signIn"
              className="border-border hover:bg-secondary rounded-md border px-3 py-1.5 font-medium"
            >
              Masuk
            </Link>
            <Link
              href="/auth/signUp"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 font-medium"
            >
              Coba gratis
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight md:text-6xl">
            Kelola klien, invoice, dan tugas dalam satu aplikasi
          </h1>
          <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-lg">
            CRM untuk kantor jasa kecil–menengah. Buat invoice kurang dari dua menit,
            bagikan link tanda tangan, dan pantau pekerjaan tim tanpa berpindah
            aplikasi.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/signUp"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-5 py-2.5 font-semibold"
            >
              Mulai uji coba <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#fitur"
              className="border-border hover:bg-secondary inline-flex items-center gap-2 rounded-md border px-5 py-2.5 font-semibold"
            >
              Lihat fitur
            </a>
          </div>
        </section>

        <section id="fitur" className="border-border border-y">
          <div className="mx-auto grid max-w-6xl gap-4 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="border-border bg-card rounded-xl border p-5">
                <Icon className="text-primary mb-3 h-5 w-5" />
                <h3 className="font-semibold">{title}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-center text-2xl font-bold">Satu alur kerja</h2>
          <p className="text-muted-foreground mt-2 text-center text-sm">
            Klien baru → tugas → invoice → tanda tangan → pembayaran.
          </p>
          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
            {[
              "Tambah klien dan kontak PIC",
              "Buat tugas dan tautkan ke klien",
              "Buat invoice dari tugas",
              "Kirim link tanda tangan",
              "Catat pembayaran",
              "Pantau dashboard",
            ].map((step) => (
              <div key={step} className="flex items-start gap-2 rounded-lg border p-3">
                <Check className="text-primary mt-0.5 h-4 w-4" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="harga" className="border-border border-t">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="text-center text-2xl font-bold">Harga per workspace</h2>
            <p className="text-muted-foreground mt-2 text-center text-sm">
              Uji coba 14 hari tanpa kartu kredit.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {DEFAULT_PLANS.map((plan) => (
                <div
                  key={plan.slug}
                  className={`rounded-xl border p-5 ${plan.isPopular ? "border-primary" : ""}`}
                >
                  <p className="font-semibold">{plan.name}</p>
                  <p className="mt-2 text-2xl font-bold">{formatPrice(plan.price)}</p>
                  <p className="text-muted-foreground text-xs">
                    {plan.price === 0 ? "selamanya" : `per ${plan.interval}`}
                  </p>
                  <ul className="mt-4 space-y-1 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="text-primary mt-0.5 h-3.5 w-3.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-border text-muted-foreground border-t px-6 py-6 text-center text-xs">
        {productName} · CRM, invoice, dan tugas untuk kantor.
      </footer>
    </div>
  );
}
