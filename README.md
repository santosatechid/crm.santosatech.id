# CRM Kantor

SaaS CRM untuk kantor jasa kecil–menengah: data klien, invoice, dan manajemen tugas dalam satu aplikasi. Mengikuti `prd.md` (MVP).

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- PostgreSQL + Prisma 7
- Better Auth (email/password, Google opsional)
- Tailwind CSS 4 + shadcn/ui
- Server Actions untuk semua mutasi (tanpa lapisan API tambahan)
- Resend HTTP API untuk email transaksional (opsional)

## Fitur

- Workspace multi-tenant; satu kantor = satu workspace, peran Owner/Admin/Member.
- Klien: CRUD, arsip, banyak kontak PIC, timeline catatan, filter/pencarian.
- Invoice: nomor otomatis per workspace, item, diskon, pajak, PDF via cetak, pembayaran sebagian, pembatalan.
- Buat invoice langsung dari tugas (tautan dua arah).
- Tugas: papan Kanban (drag & drop), daftar, filter penanggung jawab/klien, komentar, notifikasi email penugasan.
- Tanda tangan via link publik: token 256-bit (disimpan sebagai hash), kedaluwarsa 7 hari, dapat dicabut, bukti audit (IP, user-agent, SHA-256 dokumen).
- Dashboard Owner/Admin dan tampilan Tugas Saya untuk Member.
- Undangan anggota lewat email/tautan.

## Menjalankan

```bash
bun install
cp .env.example .env
# isi DATABASE_URL dan BETTER_AUTH_SECRET
bunx prisma migrate deploy
bun prisma/seed.ts
bun run dev
```

Email (undangan, invoice, reset password) memakai Resend:

```
RESEND_API_KEY=...
EMAIL_FROM="CRM Kantor <no-reply@domain.com>"
```

Tanpa kunci tersebut, tautan undangan/tanda tangan tetap dibuat dan ditampilkan di UI untuk dibagikan manual.

## Perintah

```bash
bun run dev        # development
bun run build      # production build
bun run typecheck  # tsc --noEmit
bun run lint       # eslint
```

## Struktur

```text
app/
  (dashboard)/dashboard/   # halaman setelah login
  (public)/                # landing, auth, sign/<token>, invite/<token>
  (print)/print/invoice/   # dokumen siap cetak/PDF
  actions/                 # server actions (validasi + guard workspace)
  api/auth|health          # Better Auth + health check
components/crm/            # komponen domain yang reusable
lib/                       # format, invoice, token, validasi, permission
services/                  # prisma, auth, email, signature, activity
prisma/schema.prisma       # model + migrasi
```

## Batas MVP

- PDF dihasilkan lewat dialog cetak browser ("Simpan sebagai PDF"), bukan renderer PDF server.
- Pengingat jatuh tempo otomatis (cron) belum ada; OVERDUE dihitung saat data dibaca.
- Tanda tangan adalah tanda tangan elektronik sederhana, bukan PSrE tersertifikasi.
- Satu pengguna masuk ke satu workspace (pemilihan workspace belum ada).
