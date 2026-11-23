import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Check,
  ChevronRight,
  Columns3,
  FileText,
  ListChecks,
  Lock,
  Mail,
  PenLine,
  Play,
  Plus,
  ReceiptText,
  Search,
  Signature,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { GlassButton } from "@/components/glass/button";
import { GlassBackground } from "@/components/glass/background";
import { GlassCard } from "@/components/glass/card";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Fitur", href: "#fitur" },
  { label: "Alur kerja", href: "#alur-kerja" },
  { label: "Harga", href: "#harga" },
  { label: "FAQ", href: "#faq" },
] as const;

const KPIS = [
  { label: "Klien aktif", value: "128", note: "+6 bulan ini" },
  { label: "Belum dibayar", value: "Rp 84,5 jt", note: "7 invoice" },
  { label: "Jatuh tempo", value: "3 invoice", note: "Rp 12,4 jt" },
  { label: "Diterima bulan ini", value: "Rp 52,1 jt", note: "+18,2%" },
] as const;

const INVOICES = [
  {
    client: "Nusantara Studio",
    meta: "INV-2026-0148 · jatuh tempo 28 Nov",
    amount: "Rp 24.500.000",
    status: "Lunas",
    dot: "bg-[#30D158]",
  },
  {
    client: "Karya Arsitek",
    meta: "INV-2026-0147 · jatuh tempo 28 Nov",
    amount: "Rp 12.400.000",
    status: "Jatuh tempo",
    dot: "bg-[#FF9F0A]",
  },
  {
    client: "Pasar Digital",
    meta: "INV-2026-0146 · jatuh tempo 28 Nov",
    amount: "Rp 8.750.000",
    status: "Sebagian",
    dot: "bg-[#0A84FF]",
  },
  {
    client: "Rumah Kopi",
    meta: "INV-2026-0145 · jatuh tempo 28 Nov",
    amount: "Rp 5.200.000",
    status: "Terkirim",
    dot: "bg-[#EBEBF5A6]",
  },
  {
    client: "Studio Cahaya",
    meta: "INV-2026-0144 · jatuh tempo 28 Nov",
    amount: "Rp 31.000.000",
    status: "Lunas",
    dot: "bg-[#30D158]",
  },
] as const;

const TASKS = [
  {
    title: "Kirim invoice termin 2",
    client: "Nusantara Studio",
    done: false,
    priority: "bg-[#FF453A]",
  },
  {
    title: "Review desain kemasan",
    client: "Pasar Digital",
    done: true,
    priority: "bg-[#FF9F0A]",
  },
  {
    title: "Rapat kickoff proyek",
    client: "Karya Arsitek",
    done: false,
    priority: "bg-[#40C8E0]",
  },
  {
    title: "BAST & tanda tangan",
    client: "Rumah Kopi",
    done: false,
    priority: "bg-[#FF453A]",
  },
  {
    title: "Update harga katalog",
    client: "Internal",
    done: true,
    priority: "bg-[#40C8E0]",
  },
] as const;

const BEFORE = [
  {
    title: "Data klien tersebar di banyak spreadsheet",
    detail: "Tidak ada versi yang benar-benar mutakhir.",
  },
  {
    title: "Invoice dibuat manual dari template Word",
    detail: "Sulit tahu mana yang sudah dibayar atau lewat jatuh tempo.",
  },
  {
    title: "Tugas tim tercecer di chat",
    detail: "Tidak jelas siapa mengerjakan apa dan kapan tenggatnya.",
  },
  {
    title: "Persetujuan lewat cetak, scan, kirim balik",
    detail: "Lambat, dan dokumen mudah hilang.",
  },
] as const;

const AFTER = [
  {
    title: "Satu catatan klien, kontak, dan timeline",
    detail: "Semua interaksi tercatat dengan tanggal dan penulisnya.",
  },
  {
    title: "Status invoice otomatis",
    detail: "Draft, terkirim, sebagian, lunas, jatuh tempo — tanpa hitung manual.",
  },
  {
    title: "Papan Kanban dan Tugas Saya",
    detail: "Tiap anggota tim tahu prioritas hari ini tanpa bertanya di chat.",
  },
  {
    title: "Klien menandatangani dari satu link",
    detail: "Tanpa akun, tanpa login, dengan bukti audit di baliknya.",
  },
] as const;

const WORKFLOW = [
  {
    step: "01",
    icon: UserPlus,
    title: "Klien",
    detail:
      "Tambah klien dan kontak PIC. Tandai sebagai prospek, aktif, atau tidak aktif.",
  },
  {
    step: "02",
    icon: ListChecks,
    title: "Pekerjaan",
    detail:
      "Buat tugas, tautkan ke klien, tetapkan penanggung jawab dan tenggat.",
  },
  {
    step: "03",
    icon: ReceiptText,
    title: "Tagihan",
    detail:
      "Buat invoice dari tugas atau dari halaman klien, lalu kirim dan minta tanda tangan.",
  },
  {
    step: "04",
    icon: BadgeCheck,
    title: "Pembayaran",
    detail: "Catat pembayaran penuh atau sebagian — status Lunas berubah otomatis.",
  },
] as const;

const PLANS = [
  {
    name: "Paket Kecil",
    who: "Kantor 3–5 orang",
    price: "Gratis",
    per: "selama beta tertutup",
    cta: "Mulai uji coba",
    featured: false,
    features: [
      "CRM: klien, kontak PIC, timeline",
      "Invoice, PDF berlogo, email",
      "Tugas, Kanban, dan Tugas Saya",
      "Tanda tangan invoice via link",
      "Hingga 5 pengguna",
    ],
  },
  {
    name: "Paket Tim",
    who: "Kantor 6–20 orang",
    price: "Gratis",
    per: "selama beta tertutup",
    cta: "Gabung beta tertutup",
    featured: true,
    features: [
      "Semua isi Paket Kecil",
      "Peran Owner, Admin, Member",
      "Dashboard Owner & ringkasan tim",
      "Bukti audit tanda tangan",
      "Hingga 20 pengguna",
    ],
  },
] as const;

const FAQS = [
  {
    q: "Apakah Santosa software akuntansi?",
    a: "Bukan. Santosa mencatat invoice dan pembayaran, lalu menampilkan sisa tagihan. Jurnal, laporan keuangan, dan rekonsiliasi bank berada di luar cakupan MVP.",
  },
  {
    q: "Apakah klien perlu akun untuk menandatangani?",
    a: "Tidak perlu. Klien membuka satu link, memeriksa invoice, mengisi nama dan tanda tangan, mencentang pernyataan persetujuan, lalu mengunduh PDF final.",
  },
  {
    q: "Bisakah satu tugas menghasilkan beberapa invoice?",
    a: "Bisa. Setiap invoice dari tugas tersimpan sebagai draft dengan tautan ke tugas asal — cocok untuk penagihan bertahap pada proyek panjang.",
  },
  {
    q: "Bagaimana keabsahan tanda tangannya?",
    a: "Tanda tangan elektronik sederhana dengan bukti audit: waktu, IP, user-agent, dan hash dokumen. Sertifikasi PSrE direncanakan pada fase berikutnya.",
  },
  {
    q: "Bagaimana data antar kantor dipisahkan?",
    a: "Setiap tabel membawa workspace_id dan akses lintas workspace tidak dimungkinkan. Halaman tanda tangan publik hanya diakses lewat token acak yang disimpan sebagai hash.",
  },
] as const;

const FOOTER_COLUMNS = [
  {
    title: "Produk",
    links: ["Fitur", "Alur kerja", "Harga", "Pembaruan"],
  },
  {
    title: "Perusahaan",
    links: ["Tentang", "Kontak", "Karier"],
  },
  {
    title: "Legal",
    links: ["Kebijakan privasi", "Syarat layanan", "UU PDP"],
  },
] as const;

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-[12px] font-semibold tracking-[1.8px] text-white/60">
      {children}
    </p>
  );
}

function Pill({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "lg lg-clear lg-inline inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium text-white",
        className,
      )}
    >
      {children}
    </span>
  );
}

function StatusDot({ className }: { className: string }) {
  return <span className={cn("size-[5px] rounded-full", className)} />;
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white">
      <GlassBackground shader />
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center overflow-hidden">
        {/* Nav */}
        <div className="w-full px-5 pt-5 lg:px-[120px] lg:pt-7">
          <GlassCard className="flex-row items-center justify-between gap-0 rounded-full px-3 py-2 lg:px-5">
            <Link href="/" className="flex min-h-11 items-center gap-2.5">
              <span className="flex size-[26px] items-center justify-center rounded-[9px] bg-[#0A84FF] text-[15px] font-bold">
                S
              </span>
              <span className="text-[17px] font-semibold tracking-[-0.3px]">
                santosa
              </span>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-full px-3.5 text-[14px] font-medium text-white/60 transition-colors hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/auth/signIn"
                className="inline-flex min-h-11 items-center rounded-full px-4 text-[14px] font-semibold text-white"
              >
                Masuk
              </Link>
              <GlassButton
                variant="default"
                className="h-11 rounded-full bg-[#0A84FF] px-5 text-[14px] shadow-[0_6px_18px_rgba(10,132,255,0.4)] hover:bg-[#0077ED]"
                asChild
              >
                <Link href="/auth/signUp">
                  Coba gratis
                  <ArrowRight className="size-[15px]" />
                </Link>
              </GlassButton>
            </div>
          </GlassCard>
        </div>

        {/* Hero */}
        <section className="flex w-full flex-col items-center gap-6 px-5 pt-20 text-center lg:gap-[26px] lg:px-[120px] lg:pt-[92px]">
          <span className="lg lg-regular lg-inline inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium">
            <span className="size-[7px] rounded-full bg-[#30D158]" />
            Baru · Klien menandatangani invoice lewat link, tanpa akun
          </span>

          <h1 className="max-w-[1080px] text-[40px] leading-[1.04] font-bold tracking-[-0.045em] sm:text-[56px] lg:text-[72px] lg:leading-[74px] lg:tracking-[-2.6px]">
            Klien, pekerjaan, dan tagihan.
            <br />
            Akhirnya di satu tempat.
          </h1>

          <p className="max-w-[660px] text-[17px] leading-[1.55] text-white/60 lg:text-[19px] lg:leading-[29px]">
            Santosa menyatukan CRM, invoice, dan task management untuk kantor
            jasa 3–30 orang. Buat invoice dalam 2 menit, lalu biarkan klien
            menandatanganinya dari satu link.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <GlassButton
              variant="default"
              className="h-[54px] rounded-full bg-[#0A84FF] px-[26px] text-[16px] font-semibold shadow-[0_10px_30px_rgba(10,132,255,0.35)] hover:bg-[#0077ED]"
              asChild
            >
              <Link href="/auth/signUp">
                Mulai uji coba 14 hari
                <ArrowRight className="size-[17px]" />
              </Link>
            </GlassButton>
            <GlassButton
              variant="liquid"
              material="clear"
              className="h-[54px] gap-2.5 rounded-full px-6 text-[16px] font-semibold"
              asChild
            >
              <a href="#fitur">
                <Play className="size-[15px]" />
                Lihat demo 2 menit
              </a>
            </GlassButton>
          </div>

          <p className="text-[13px] text-white/60">
            Tanpa kartu kredit · Bahasa Indonesia & Rupiah · Data terisolasi per
            workspace
          </p>

          {/* App mock */}
          <div className="mt-2 w-full max-w-[1160px] pt-6">
            <GlassCard className="gap-4 rounded-[30px] p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-5 items-center justify-center rounded-[7px] bg-[#0A84FF] text-[11px] font-bold">
                    S
                  </span>
                  <span className="text-[13px] font-semibold">santosa</span>
                  <span className="h-3.5 w-px bg-white/10" />
                  <span className="text-[13px] text-white/60">Dashboard</span>
                </div>
                <div className="hidden items-center gap-2.5 sm:flex">
                  <Pill className="gap-[7px] px-3 py-1.5 text-[12px] text-white/60">
                    <Search className="size-[13px] opacity-40" />
                    Cari klien, invoice, tugas…
                  </Pill>
                  <span className="lg lg-clear lg-inline flex size-[26px] items-center justify-center rounded-full text-[11px] font-semibold">
                    AR
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {KPIS.map((kpi) => (
                  <GlassCard
                    key={kpi.label}
                    className="gap-[7px] rounded-[18px] px-4 py-4"
                  >
                    <p className="text-[11px] font-medium text-white/60">
                      {kpi.label}
                    </p>
                    <p className="text-[22px] font-semibold tracking-[-0.6px] tabular-nums lg:text-[24px]">
                      {kpi.value}
                    </p>
                    <p className="text-[11px] text-white/60">{kpi.note}</p>
                  </GlassCard>
                ))}
              </div>

              <div className="grid gap-3 lg:grid-cols-[1fr_330px]">
                <GlassCard className="gap-0 overflow-hidden rounded-[18px]">
                  <div className="flex items-center justify-between px-4 py-3">
                    <p className="text-[13px] font-semibold">Invoice terbaru</p>
                    <Pill className="gap-[5px] px-2.5 py-1">
                      <Plus className="size-3" />
                      Buat invoice
                    </Pill>
                  </div>
                  {INVOICES.map((invoice) => (
                    <div
                      key={invoice.meta}
                      className="flex items-center gap-3 border-t border-white/10 px-4 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium">
                          {invoice.client}
                        </p>
                        <p className="truncate text-[11px] text-white/60">
                          {invoice.meta}
                        </p>
                      </div>
                      <p className="hidden text-[13px] font-semibold tabular-nums sm:block">
                        {invoice.amount}
                      </p>
                      <Pill className="gap-[5px] px-2">
                        <StatusDot className={invoice.dot} />
                        {invoice.status}
                      </Pill>
                    </div>
                  ))}
                </GlassCard>

                <GlassCard className="gap-0 overflow-hidden rounded-[18px]">
                  <div className="flex items-center justify-between px-4 py-3">
                    <p className="text-[13px] font-semibold">Tugas saya</p>
                    <div className="flex gap-1">
                      <Pill className="px-2">Hari ini</Pill>
                      <span className="rounded-full px-2 py-1 text-[11px] font-medium text-white/60">
                        Semua
                      </span>
                    </div>
                  </div>
                  {TASKS.map((task) => (
                    <div
                      key={task.title}
                      className="flex items-center gap-2.5 border-t border-white/10 px-4 py-2.5"
                    >
                      <span
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded-[5px] border",
                          task.done
                            ? "border-[#30D158] bg-[#30D158]"
                            : "border-white/25",
                        )}
                      >
                        {task.done && <Check className="size-3 text-white" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "truncate text-[12px] font-medium",
                            task.done && "text-white/60 line-through",
                          )}
                        >
                          {task.title}
                        </p>
                        <p className="truncate text-[11px] text-white/60">
                          {task.client}
                        </p>
                      </div>
                      <span
                        className={cn("size-1.5 rounded-full", task.priority)}
                      />
                    </div>
                  ))}
                </GlassCard>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Stats */}
        <div className="w-full px-5 pt-14 lg:px-[120px]">
          <GlassCard className="grid grid-cols-2 gap-0 rounded-[26px] p-0 lg:grid-cols-4">
            {[
              ["2 menit", "Median membuat invoice"],
              ["< 15 menit", "Onboarding tanpa pelatihan"],
              ["Tanpa akun", "Klien menandatangani via link"],
              ["99,5%", "Target ketersediaan layanan"],
            ].map(([value, label]) => (
              <div
                key={value}
                className="border-white/10 px-6 py-5 not-last:border-b lg:not-last:border-r lg:not-last:border-b-0"
              >
                <p className="text-[26px] font-semibold tracking-[-0.6px] tabular-nums">
                  {value}
                </p>
                <p className="mt-1 text-[13px] text-white/60">{label}</p>
              </div>
            ))}
          </GlassCard>
        </div>

        {/* Problem */}
        <section
          id="fitur"
          className="flex w-full flex-col gap-10 px-5 pt-24 lg:px-[120px] lg:pt-[110px]"
        >
          <div className="flex max-w-[760px] flex-col gap-4">
            <Eyebrow>MASALAHNYA</Eyebrow>
            <h2 className="text-[32px] leading-[1.15] font-semibold tracking-[-0.035em] lg:text-[44px] lg:leading-[51px] lg:tracking-[-1.4px]">
              Berhenti berpindah antara Excel, WhatsApp, dan Word.
            </h2>
            <p className="text-[16px] leading-[26px] text-white/60">
              Kantor jasa kecil menjalankan operasional dengan campuran
              spreadsheet, chat, dan dokumen terpisah. Data klien tidak
              mutakhir, invoice sulit dilacak, dan tugas tim tercecer.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <GlassCard className="gap-[22px] rounded-[28px] p-8">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[20px] font-semibold tracking-[-0.3px] text-white/60">
                  Sebelum Santosa
                </p>
                <p className="text-[12px] text-white/60">
                  4 hal yang bikin lambat
                </p>
              </div>
              <ul>
                {BEFORE.map((item) => (
                  <li
                    key={item.title}
                    className="flex gap-3 border-t border-white/10 py-4"
                  >
                    <span className="lg lg-clear lg-inline flex size-6 shrink-0 items-center justify-center rounded-lg">
                      <X className="size-3.5 text-white/60" />
                    </span>
                    <div>
                      <p className="text-[15px] font-medium text-white/60">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-[13px] leading-[19px] text-white/60">
                        {item.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard
              material="regular"
              glass={{ tint: "rgba(255,255,255,0.09)" }}
              className="gap-[22px] rounded-[28px] p-8"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[20px] font-semibold tracking-[-0.3px]">
                  Dengan Santosa
                </p>
                <p className="text-[12px] text-white/60">
                  Satu siklus, satu tempat
                </p>
              </div>
              <ul>
                {AFTER.map((item) => (
                  <li
                    key={item.title}
                    className="flex gap-3 border-t border-white/10 py-4"
                  >
                    <span className="lg lg-regular lg-inline flex size-6 shrink-0 items-center justify-center rounded-lg">
                      <Check className="size-3.5 text-[#30D158]" />
                    </span>
                    <div>
                      <p className="text-[15px] font-medium">{item.title}</p>
                      <p className="mt-0.5 text-[13px] leading-[19px] text-white/60">
                        {item.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </section>

        {/* Modules */}
        <section className="flex w-full flex-col gap-10 px-5 pt-24 lg:px-[120px] lg:pt-[110px]">
          <div className="flex flex-col items-end justify-between gap-6 lg:flex-row">
            <div className="flex flex-1 flex-col gap-3.5">
              <Eyebrow>TIGA MODUL</Eyebrow>
              <h2 className="text-[32px] leading-[1.15] font-semibold tracking-[-0.035em] lg:text-[44px] lg:leading-[51px] lg:tracking-[-1.4px]">
                Satu workspace untuk klien, tagihan, dan pekerjaan tim.
              </h2>
            </div>
            <p className="max-w-[400px] text-[15px] leading-[24px] text-white/60">
              Setiap modul berdiri sendiri, tetapi datanya saling terhubung:
              klien punya tugas, tugas menghasilkan invoice, invoice punya
              pembayaran.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {/* CRM */}
            <GlassCard className="gap-[18px] rounded-[28px] p-6">
              <div className="flex items-center justify-between">
                <span className="lg lg-regular lg-inline flex size-9 items-center justify-center rounded-xl">
                  <Users className="size-[17px]" />
                </span>
                <span className="text-[11px] font-semibold tracking-[1.6px] text-white/60">
                  CRM
                </span>
              </div>
              <div>
                <p className="text-[23px] font-semibold tracking-[-0.5px]">
                  Klien &amp; kontak
                </p>
                <p className="mt-2 text-[14px] leading-[22px] text-white/60">
                  Satu halaman detail klien: info perusahaan, banyak kontak PIC,
                  catatan dan timeline interaksi, tugas serta invoice terkait,
                  dan total tagihan yang belum dibayar.
                </p>
              </div>
              <GlassCard className="h-[206px] gap-0 overflow-hidden rounded-[18px] p-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="size-[34px] rounded-[10px] bg-[#0A84FF]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">
                      Nusantara Studio
                    </p>
                    <p className="truncate text-[11px] text-white/60">
                      Agensi · Jakarta Selatan
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-[#30D158]/15 px-2 py-1 text-[11px] font-medium">
                    <StatusDot className="bg-[#30D158]" />
                    Aktif
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 border-t border-white/10 py-2.5 text-[11px]">
                  <User className="size-3 text-white/60" />
                  <span className="text-white/60">Kontak utama</span>
                  <span className="ml-auto font-medium text-white/60">
                    Rina Prasetyo
                  </span>
                </div>
                <div className="flex items-center gap-2 border-t border-white/10 py-2.5 text-[11px]">
                  <FileText className="size-3 text-white/60" />
                  <span className="text-white/60">NPWP</span>
                  <span className="ml-auto font-medium text-white/60">
                    01.234.567.8-901.000
                  </span>
                </div>
                <div className="mt-auto flex items-center gap-2 border-t border-white/10 pt-2.5 text-[11px] text-white/60">
                  <StatusDot className="bg-[#0A84FF]" />
                  Telepon kickoff proyek — 12 Nov, Andi
                </div>
              </GlassCard>
            </GlassCard>

            {/* Invoicing */}
            <GlassCard className="gap-[18px] rounded-[28px] p-6">
              <div className="flex items-center justify-between">
                <span className="lg lg-regular lg-inline flex size-9 items-center justify-center rounded-xl">
                  <ReceiptText className="size-[17px]" />
                </span>
                <span className="text-[11px] font-semibold tracking-[1.6px] text-white/60">
                  INVOICING
                </span>
              </div>
              <div>
                <p className="text-[23px] font-semibold tracking-[-0.5px]">
                  Invoice &amp; pembayaran
                </p>
                <p className="mt-2 text-[14px] leading-[22px] text-white/60">
                  Nomor otomatis (INV-2026-0001), pajak dan diskon yang dapat
                  diatur, PDF berlogo kantor, kirim lewat email, serta
                  pencatatan pembayaran sebagian.
                </p>
              </div>
              <GlassCard className="h-[206px] gap-0 overflow-hidden rounded-[18px] p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-semibold tracking-[0.2px]">
                    INV-2026-0148
                  </p>
                  <span className="flex items-center gap-1 rounded-full bg-[#30D158]/15 px-2 py-0.5 text-[11px] font-semibold">
                    <Check className="size-2.5 text-[#30D158]" />
                    Lunas
                  </span>
                </div>
                {[
                  ["Desain identitas", "Rp 18.000.000"],
                  ["Revisi & finalisasi", "Rp 6.500.000"],
                ].map(([label, amount]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between border-t border-white/10 py-2 text-[11px]"
                  >
                    <span className="text-white/60">{label}</span>
                    <span className="font-medium">{amount}</span>
                  </div>
                ))}
                <div className="mt-auto flex items-center justify-between rounded-xl bg-white/10 px-2.5 py-2">
                  <span className="text-[11px] font-semibold text-white/60">
                    Total
                  </span>
                  <span className="text-[13px] font-semibold tabular-nums">
                    Rp 24.500.000
                  </span>
                </div>
              </GlassCard>
            </GlassCard>

            {/* Tasks */}
            <GlassCard className="gap-[18px] rounded-[28px] p-6">
              <div className="flex items-center justify-between">
                <span className="lg lg-regular lg-inline flex size-9 items-center justify-center rounded-xl">
                  <Columns3 className="size-[17px]" />
                </span>
                <span className="text-[11px] font-semibold tracking-[1.6px] text-white/60">
                  TUGAS
                </span>
              </div>
              <div>
                <p className="text-[23px] font-semibold tracking-[-0.5px]">
                  Task management
                </p>
                <p className="mt-2 text-[14px] leading-[22px] text-white/60">
                  Tenggat, prioritas, penanggung jawab, dan komentar. Dua
                  tampilan — daftar dan papan Kanban — plus Tugas Saya yang
                  selalu urut berdasarkan tenggat.
                </p>
              </div>
              <GlassCard className="flex h-[206px] flex-col gap-2.5 rounded-[18px] p-3.5">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      label: "To Do",
                      dot: "bg-[#EBEBF580]",
                      cards: ["Brief kemasan", "Riset kompetitor"],
                    },
                    {
                      label: "Progress",
                      dot: "bg-[#FF9F0A]",
                      cards: ["Desain layout"],
                    },
                    {
                      label: "Selesai",
                      dot: "bg-[#30D158]",
                      cards: ["Moodboard", "Foto produk"],
                    },
                  ].map((column) => (
                    <div key={column.label} className="flex flex-col gap-1.5">
                      <p className="flex items-center gap-1 text-[11px] font-semibold text-white/60">
                        <StatusDot className={column.dot} />
                        {column.label}
                      </p>
                      {column.cards.map((card) => (
                        <div
                          key={card}
                          className="lg lg-regular rounded-[9px] p-2"
                        >
                          <p className="text-[11px] leading-[14px] font-medium">
                            {card}
                          </p>
                          <p className="mt-1 text-[11px] text-white/60">
                            28 Nov
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-center gap-2 rounded-full bg-[#0A84FF] px-3 py-2 text-[11px] font-semibold">
                  <ReceiptText className="size-3" />
                  Buat invoice dari tugas ini
                </div>
              </GlassCard>
            </GlassCard>
          </div>
        </section>

        {/* Signature */}
        <div className="w-full px-5 pt-24 lg:px-[120px] lg:pt-[110px]">
          <div
            className="flex w-full flex-col items-start gap-14 rounded-[36px] border border-white/20 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.35)] lg:flex-row lg:p-[64px_56px]"
            style={{
              backgroundColor: "#150D28",
              backgroundImage:
                "radial-gradient(ellipse 40% 40% at 85% 5%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%), linear-gradient(-116.946deg, #FF7A3D 14.645%, #FF2D87 44.343%, #7C4DFF 69.799%, #00C2FF 85.355%)",
            }}
          >
            <div className="flex flex-1 flex-col gap-[22px] rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-2xl lg:p-8">
              <span className="lg lg-clear lg-inline flex w-fit items-center gap-[7px] rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[1.6px]">
                <Signature className="size-3" />
                PEMBEDA UTAMA
              </span>
              <h2 className="text-[34px] leading-[1.15] font-semibold tracking-[-1px] lg:text-[42px] lg:leading-[48px] lg:tracking-[-1.3px]">
                Klien menandatangani invoice tanpa membuat akun.
              </h2>
              <p className="text-[16px] leading-[26px] text-white/85">
                Satu link, berlaku 7 hari, dapat dicabut kapan saja. Tidak ada
                cetak, scan, atau kirim balik lewat chat — dan tidak ada data
                workspace lain yang bisa diakses dari halaman itu.
              </p>
              <div className="pt-1.5">
                {[
                  [
                    "01",
                    "Buat link dari invoice terkirim",
                    "Hanya satu link aktif per invoice. Token 256-bit disimpan sebagai hash.",
                  ],
                  [
                    "02",
                    "Klien membuka tanpa login",
                    "Halaman publik hanya menampilkan invoice tersebut, tidak diindeks mesin pencari.",
                  ],
                  [
                    "03",
                    "Tanda tangan & PDF final",
                    "Nama, waktu, IP, dan hash dokumen tercatat sebagai bukti audit.",
                  ],
                ].map(([step, title, detail]) => (
                  <div
                    key={step}
                    className="flex gap-4 border-t border-white/20 py-3.5"
                  >
                    <span className="text-[12px] font-semibold text-white/65">
                      {step}
                    </span>
                    <div>
                      <p className="text-[15px] font-semibold">{title}</p>
                      <p className="mt-0.5 text-[13px] leading-[19px] text-white/70">
                        {detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sign page mock */}
            <GlassCard className="w-full gap-4 rounded-[26px] p-[22px] lg:w-[440px] lg:shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-lg bg-white text-[13px] font-bold text-[#0A84FF]">
                    S
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold">Nusantara Studio</p>
                    <p className="text-[11px] text-white/65">
                      INV-2026-0148 · Jatuh tempo 28 Nov
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-black/25 px-2 py-1 text-[11px] font-medium">
                  <Lock className="size-2.5" />
                  Aman
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/15 bg-black/20 px-4 py-3.5">
                <div>
                  <p className="text-[11px] text-white/65">Total tagihan</p>
                  <p className="text-[24px] font-semibold tracking-[-0.6px] tabular-nums">
                    Rp 24.500.000
                  </p>
                </div>
                <p className="text-[11px] text-white/65">2 item · PPN 11%</p>
              </div>

              <div className="flex flex-col gap-2.5">
                {[
                  ["Nama penanda tangan", "Rina Prasetyo"],
                  ["Email (opsional)", "rina@nusantara.studio"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="lg lg-clear rounded-[13px] px-3 py-2"
                  >
                    <p className="text-[11px] text-white/65">{label}</p>
                    <p className="text-[13px]">{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex h-[92px] flex-col justify-end rounded-[14px] border border-white/35 bg-black/20 px-3 py-2.5">
                <svg
                  viewBox="0 0 150 64"
                  preserveAspectRatio="none"
                  className="h-16 w-[150px] overflow-visible"
                  aria-hidden
                >
                  <path
                    d="M2.865 40.422q3.161-5.993 6.422-9.021 3.027-2.81 6.353-3.262 1.493-.203 3.09.059 1.393.23 2.943.83 1.264.489 2.815 1.302.916.481 2.728 1.514 1.705.972 2.554 1.421 1.393.735 2.507 1.185 1.309.528 2.457.759 1.258.252 2.413.168 1.249-.091 2.442-.579 1.302-.532 2.583-1.551 2.866-2.283 5.718-7.091 2.297-3.733 4.656-5.292 2.279-1.504 4.771-1.129 1.091.164 2.253.695 1.002.458 2.128 1.223.92.625 2.068 1.559.681.555 2.057 1.734 1.607 1.378 2.43 2.038 1.359 1.089 2.488 1.818 1.337.862 2.559 1.363 1.349.551 2.643.699 1.402.16 2.8-.147 1.528-.335 3.098-1.236 3.539-2.031 7.368-6.982 2.064-2.61 4.446-3.765 2.181-1.058 4.746-.955 1.127.045 2.378.314 1.098.236 2.366.662 1.046.352 2.371.89.789.32 2.386 1.005 1.767.758 2.664 1.119 1.486.598 2.696.994 1.442.471 2.727.735 1.433.294 2.759.35 2.964.126 5.684-.94 3.118-1.223 6.13-4.078.144-.137.33-.208.186-.071.385-.066.198.005.38.086.182.081.319.226.137.144.208.33.071.185.066.384-.006.199-.087.381-.081.181-.225.318-3.294 3.124-6.776 4.489-3.113 1.22-6.499 1.076-1.486-.063-3.076-.389-1.396-.287-2.946-.793-1.274-.416-2.822-1.04-.918-.369-2.705-1.136-1.58-.677-2.351-.99-1.267-.515-2.255-.847-1.162-.391-2.15-.603-1.082-.233-2.037-.271-2.063-.083-3.793.756-1.97.956-3.737 3.19-4.072 5.265-7.955 7.493-3.558 2.041-7.12 1.635-1.568-.179-3.173-.835-1.394-.571-2.886-1.534-1.216-.784-2.655-1.938-.849-.68-2.481-2.079-1.356-1.163-2.018-1.701-1.081-.88-1.929-1.457-.986-.67-1.835-1.058-.906-.414-1.719-.536-.845-.127-1.642.053-.866.197-1.729.767-1.991 1.315-4.039 4.644-3.039 5.123-6.192 7.634-2.923 2.327-6.125 2.561-1.428.104-2.953-.203-1.33-.267-2.811-.864-1.209-.488-2.693-1.272-.877-.463-2.611-1.452-1.781-1.015-2.666-1.479-1.45-.76-2.608-1.209-1.357-.525-2.546-.721-1.3-.214-2.496-.052-1.298.177-2.546.806-1.367.689-2.715 1.941-3.012 2.796-6.013 8.488-.093.176-.246.303-.153.127-.343.186-.19.059-.388.041-.199-.019-.374-.112-.176-.092-.303-.245-.127-.153-.186-.343-.059-.191-.041-.389.019-.198.111-.374z"
                    fill="#ffffff"
                  />
                </svg>
                <p className="text-[11px] text-white/65">Tanda tangan</p>
              </div>

              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[5px] bg-[#0A84FF]">
                  <Check className="size-3 text-white" />
                </span>
                <p className="text-[11px] leading-[15px] text-white/85">
                  Saya menyetujui invoice ini dan tanda tangan elektronik
                  sederhana.
                </p>
              </div>

              <GlassButton
                variant="default"
                className="h-[46px] w-full rounded-full bg-white text-[14px] font-semibold text-[#0B0B12] shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:bg-white/90"
              >
                <PenLine className="size-[15px]" />
                Tandatangani invoice
              </GlassButton>
            </GlassCard>
          </div>
        </div>

        {/* Workflow */}
        <section
          id="alur-kerja"
          className="flex w-full flex-col gap-10 px-5 pt-24 lg:px-[120px] lg:pt-[110px]"
        >
          <div className="flex max-w-[760px] flex-col gap-4">
            <Eyebrow>ALUR KERJA</Eyebrow>
            <h2 className="text-[32px] leading-[1.15] font-semibold tracking-[-0.035em] lg:text-[44px] lg:leading-[51px] lg:tracking-[-1.4px]">
              Satu siklus: klien baru sampai lunas.
            </h2>
            <p className="text-[16px] leading-[26px] text-white/60">
              Empat langkah yang dulu tersebar di empat aplikasi berbeda.
              Sekarang saling terhubung — data klien mengalir ke tugas, tugas
              menjadi invoice, invoice menjadi pembayaran.
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
            {WORKFLOW.map((item, index) => (
              <div key={item.step} className="flex items-center gap-3">
                <GlassCard className="flex-1 gap-3 rounded-[22px] p-[22px]">
                  <div className="flex items-center justify-between">
                    <span className="lg lg-regular lg-inline flex size-8 items-center justify-center rounded-[11px]">
                      <item.icon className="size-[15px]" />
                    </span>
                    <span className="text-[13px] font-semibold text-white/60">
                      {item.step}
                    </span>
                  </div>
                  <p className="text-[19px] font-semibold tracking-[-0.2px]">
                    {item.title}
                  </p>
                  <p className="text-[13px] leading-[20px] text-white/60">
                    {item.detail}
                  </p>
                </GlassCard>
                {index < WORKFLOW.length - 1 && (
                  <ChevronRight className="hidden size-4 shrink-0 text-white/25 lg:block" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section
          id="harga"
          className="flex w-full flex-col gap-10 px-5 pt-24 lg:px-[120px] lg:pt-[110px]"
        >
          <div className="flex max-w-[760px] flex-col gap-3.5">
            <Eyebrow>HARGA</Eyebrow>
            <h2 className="text-[32px] leading-[1.15] font-semibold tracking-[-0.035em] lg:text-[44px] lg:leading-[51px] lg:tracking-[-1.4px]">
              Satu langganan per workspace.
            </h2>
            <p className="text-[16px] leading-[26px] text-white/60">
              Uji coba 14 hari tanpa kartu kredit. Paket dibatasi jumlah
              pengguna, bukan jumlah klien atau invoice.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {PLANS.map((plan) => (
              <GlassCard
                key={plan.name}
                material="regular"
                glass={
                  plan.featured
                    ? { tint: "#0A84FF", frost: 0.5 }
                    : undefined
                }
                className={cn(
                  "gap-[22px] rounded-[28px] p-[30px]",
                  plan.featured && "ring-1 ring-[#7FB8FF]/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[21px] font-semibold tracking-[-0.3px]">
                      {plan.name}
                    </p>
                    <p className="mt-1 text-[13px] text-white/60">
                      {plan.who}
                    </p>
                  </div>
                  {plan.featured && (
                    <span className="rounded-full bg-[#0A84FF] px-3 py-1 text-[11px] font-semibold">
                      Paling pas
                    </span>
                  )}
                </div>

                <div className="flex items-end gap-2">
                  <p className="text-[40px] font-semibold tracking-[-1.2px]">
                    {plan.price}
                  </p>
                  <p className="pb-2 text-[13px] text-white/60">
                    {plan.per}
                  </p>
                </div>

                <GlassButton
                  variant={plan.featured ? "default" : "liquid"}
                  material={plan.featured ? undefined : "clear"}
                  className={cn(
                    "h-12 w-full rounded-full text-[15px] font-semibold",
                    plan.featured
                      ? "bg-[#0A84FF] shadow-[0_8px_26px_rgba(10,132,255,0.4)] hover:bg-[#0077ED]"
                      : "text-white",
                  )}
                  asChild
                >
                  <Link href="/auth/signUp">{plan.cta}</Link>
                </GlassButton>

                <ul>
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2.5 border-t border-white/10 py-[11px] text-[14px] text-white/60"
                    >
                      <Check
                        className={cn(
                          "size-3.5 shrink-0",
                          plan.featured ? "text-[#0A84FF]" : "text-white/50",
                        )}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <p className="text-[12px] leading-[17px] text-white/60">
                  Harga final ditentukan setelah validasi dengan kantor pengguna
                  beta.
                </p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="flex w-full flex-col gap-10 px-5 pt-24 lg:flex-row lg:gap-16 lg:px-[120px] lg:pt-[110px]"
        >
          <div className="flex max-w-[360px] shrink-0 flex-col gap-3.5">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="text-[30px] leading-[1.16] font-semibold tracking-[-0.03em] lg:text-[38px] lg:leading-[44px] lg:tracking-[-1.2px]">
              Pertanyaan yang sering muncul.
            </h2>
            <p className="text-[14px] leading-[22px] text-white/60">
              Belum terjawab? Kirim pertanyaan lewat email — kami balas dalam
              satu hari kerja.
            </p>
            <a
              href="mailto:halo@santosa.id"
              className="mt-1 inline-flex min-h-11 items-center gap-2 text-[14px] font-medium"
            >
              <Mail className="size-[15px] text-white/65" />
              halo@santosa.id
            </a>
          </div>

          <div className="flex-1">
            {FAQS.map((faq) => (
              <div
                key={faq.q}
                className="flex gap-5 border-t border-white/10 py-5"
              >
                <div className="flex-1">
                  <p className="text-[18px] font-semibold tracking-[-0.2px]">
                    {faq.q}
                  </p>
                  <p className="mt-1.5 text-[14px] leading-[22px] text-white/60">
                    {faq.a}
                  </p>
                </div>
                <Plus className="mt-1 size-4 shrink-0 text-white/35" />
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <div className="w-full px-5 pt-24 lg:px-[120px] lg:pt-[110px]">
          <div
            className="flex w-full flex-col items-center gap-[22px] rounded-[36px] border border-white/20 px-6 py-14 text-center shadow-[0_24px_60px_rgba(0,0,0,0.4)] lg:px-16 lg:py-[72px]"
            style={{
              backgroundColor: "#0F1024",
              backgroundImage:
                "radial-gradient(ellipse 45% 45% at 85% 0%, rgba(192,64,255,0.3) 0%, rgba(192,64,255,0) 100%), radial-gradient(ellipse 55% 50% at 50% 110%, rgba(10,132,255,0.35) 0%, rgba(10,132,255,0) 100%)",
            }}
          >
            <h2 className="max-w-[760px] text-[36px] leading-[1.1] font-semibold tracking-[-0.04em] lg:text-[52px] lg:leading-[57px] lg:tracking-[-1.8px]">
              Mulai dari satu klien hari ini.
            </h2>
            <p className="max-w-[560px] text-[16px] leading-[26px] text-white/60">
              Uji coba 14 hari, tanpa kartu kredit. Tambah klien, buat tugas
              pertama, lalu kirim invoice pertama Anda sebelum hari ke-14.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1.5">
              <GlassButton
                variant="default"
                className="h-[52px] rounded-full bg-[#0A84FF] px-6 text-[15px] font-semibold shadow-[0_10px_30px_rgba(10,132,255,0.35)] hover:bg-[#0077ED]"
                asChild
              >
                <Link href="/auth/signUp">
                  Buat workspace gratis
                  <ArrowRight className="size-4" />
                </Link>
              </GlassButton>
              <GlassButton
                variant="liquid"
                material="clear"
                className="h-[52px] gap-2 rounded-full px-[22px] text-[15px] font-semibold"
                asChild
              >
                <a href="mailto:halo@santosa.id">
                  <CalendarClock className="size-[15px]" />
                  Jadwalkan demo
                </a>
              </GlassButton>
            </div>
            <p className="text-[12px] text-white/60">
              Beta tertutup · 5–10 kantor · Bahasa Indonesia &amp; Rupiah
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex w-full flex-col gap-9 px-5 pt-24 pb-12 lg:px-[120px] lg:pt-24">
          <div className="flex flex-col justify-between gap-10 lg:flex-row">
            <div className="max-w-[320px]">
              <div className="flex items-center gap-2.5">
                <span className="flex size-[26px] items-center justify-center rounded-[9px] bg-[#0A84FF] text-[15px] font-bold">
                  S
                </span>
                <span className="text-[17px] font-semibold tracking-[-0.3px]">
                  santosa
                </span>
              </div>
              <p className="mt-3.5 text-[13px] leading-[21px] text-white/60">
                CRM, invoice, dan task management untuk kantor jasa di
                Indonesia. Satu workspace, satu siklus kerja.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:flex lg:gap-16">
              {FOOTER_COLUMNS.map((column) => (
                <div key={column.title} className="flex w-[150px] flex-col gap-[11px]">
                  <p className="text-[12px] font-semibold tracking-[0.6px] text-white/60">
                    {column.title}
                  </p>
                  {column.links.map((link) => (
                    <a
                      key={link}
                      href="#"
                      className="inline-flex min-h-11 items-center text-[14px] font-medium text-white/60 transition-colors hover:text-white"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
            <p className="text-[12px] text-white/60">
              © 2026 Santosa · crm.santosatech.id
            </p>
            <div className="flex items-center gap-2">
              {[Mail, Users, User].map((Icon, index) => (
                <GlassButton
                  key={index}
                  variant="liquid"
                  material="clear"
                  size="icon"
                  aria-label="Sosial"
                  className="size-11 rounded-full"
                >
                  <Icon className="size-3.5" />
                </GlassButton>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
