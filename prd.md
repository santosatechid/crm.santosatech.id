PRD: CRM, Invoicing & Task Management untuk Kantor (MVP)
Versi 0.2 (Draft) · 22 November 2026 · Status: untuk review
Perubahan 0.1 → 0.2: modul Tanda Tangan Elektronik via link, pembuatan invoice dari tugas, penyesuaian model data.

1. Ringkasan
[Nama Produk] adalah aplikasi SaaS berbasis web untuk kantor kecil–menengah yang menyatukan tiga hal dalam satu tempat: data klien (CRM), penagihan (invoicing), dan pekerjaan tim (task management).

Versi pertama sengaja dibuat sederhana. Fokusnya satu siklus utama: klien baru → pekerjaan → tagihan → pembayaran, tanpa harus pindah-pindah antara Excel, WhatsApp, dan template invoice di Word.

Dua kemampuan yang membedakan MVP ini dari sekadar template invoice:
• Invoice dapat dibuat langsung dari tugas, sehingga pekerjaan dan tagihan tidak pernah lepas (pola kerja ala Salesforce: record pekerjaan menjadi sumber dokumen penagihan).
• Klien dapat menandatangani invoice lewat link yang dibagikan, tanpa akun dan tanpa login.

2. Latar Belakang & Masalah
Kantor jasa kecil (agensi, konsultan, studio, kontraktor, firma profesional) umumnya mengelola operasional dengan campuran spreadsheet, chat, dan dokumen terpisah. Akibatnya:
• Data klien tersebar dan tidak selalu mutakhir.
• Invoice dibuat manual, sulit melacak mana yang sudah dibayar atau sudah lewat jatuh tempo.
• Tugas tim tercecer di chat; tidak jelas siapa mengerjakan apa dan kapan tenggatnya.
• Tidak ada satu tampilan yang menghubungkan klien, pekerjaan, dan tagihan.
• Persetujuan klien (tanda tangan invoice/berita acara) dilakukan dengan cetak, scan, dan kirim balik lewat chat — lambat dan mudah hilang.

3. Tujuan & Non-Tujuan
Tujuan MVP
1. Menyediakan satu tempat untuk data klien, tugas, dan invoice.
2. Membuat dan mengirim invoice dalam waktu kurang dari 2 menit.
3. Membuat tim tahu tugas masing-masing tanpa harus bertanya di chat.
4. Onboarding selesai dalam waktu kurang dari 15 menit tanpa pelatihan.
5. Klien dapat menyetujui/menandatangani dokumen lewat satu link tanpa membuat akun.

Non-Tujuan (tidak dikerjakan di MVP)
• Bukan software akuntansi lengkap (tidak ada jurnal, laporan keuangan, rekonsiliasi bank).
• Bukan CRM sales tingkat enterprise (tidak ada forecasting, lead scoring, atau otomasi kompleks).
• Bukan tool project management penuh (tidak ada Gantt, dependensi tugas, atau time tracking).
• Tidak ada aplikasi mobile native; cukup web yang responsif.
• Tidak ada integrasi pihak ketiga di rilis pertama.
• Tanda tangan elektronik tersertifikasi (PSrE) dan sertifikat digital tidak termasuk MVP; lihat 6.6.

4. Target Pengguna
Segmen awal: kantor berbasis jasa dengan 3–30 orang.

Persona:
• Pemilik / Manajer (Owner/Admin): ingin tahu siapa saja kliennya, berapa tagihan yang belum dibayar, dan apa yang sedang dikerjakan tim.
• Staf keuangan / admin kantor: membuat invoice, mengirimnya, dan mencatat pembayaran. Di kantor kecil, peran ini sering dirangkap oleh Owner.
• Anggota tim (Member): ingin tahu tugas miliknya, tenggatnya, dan bisa memperbarui status dengan cepat.
• Klien (pihak eksternal, tanpa akun): membuka link, memeriksa dokumen, dan menandatanganinya.

Peran & hak akses:
• Owner: semua akses, termasuk pengaturan langganan.
• Admin: kelola klien, invoice, tugas, dan anggota tim.
• Member: lihat klien, kelola tugas; tidak dapat mengakses invoice (lihat Pertanyaan Terbuka).
• Klien eksternal: hanya dapat membuka link tanda tangan yang dibagikan; tidak punya akses ke workspace.

5. Ruang Lingkup MVP
MVP terdiri dari lima modul inti: Akun & Workspace, Klien (CRM), Invoice, Tugas, dan Dashboard, ditambah satu modul pendukung: Tanda Tangan Elektronik via link.

Prioritas fitur: P0 = wajib ada di MVP, P1 = sebaiknya ada jika waktu cukup, P2 = ditunda ke fase berikutnya.

6. Kebutuhan Fungsional
6.1 Akun, Workspace & Peran
• [P0] Daftar dan login dengan email + password; lupa password via email.
• [P0] Satu workspace mewakili satu kantor; data antar workspace terisolasi penuh (multi-tenant).
• [P0] Undang anggota lewat email dan tetapkan peran (Owner, Admin, Member).
• [P0] Profil kantor: nama, logo, alamat, kontak, dan info rekening bank yang akan tampil di invoice.
• [P1] Login dengan Google.

6.2 CRM: Klien & Kontak
• [P0] Tambah, ubah, hapus (arsip) klien: nama perusahaan/individu, alamat, email, telepon, NPWP/ID pajak (opsional).
• [P0] Beberapa kontak (PIC) per klien: nama, jabatan, email, telepon; satu kontak ditandai sebagai kontak utama.
• [P0] Status klien: Prospek, Aktif, Tidak Aktif.
• [P0] Catatan dan riwayat interaksi (timeline): catatan telepon atau meeting lengkap dengan tanggal dan penulisnya.
• [P0] Pencarian dan filter berdasarkan nama dan status.
• [P0] Halaman detail klien yang menampilkan info klien, kontak, catatan, tugas terkait, invoice terkait, dan total tagihan yang belum dibayar.
• [P1] Tag klien dan import/export CSV.

6.3 Invoicing
• [P0] Buat invoice untuk klien dengan: nomor otomatis (format dapat diatur, contoh INV-2026-0001), tanggal terbit, tanggal jatuh tempo, item baris (deskripsi, jumlah, harga satuan), diskon, pajak (persentase dapat diatur), dan total yang dihitung otomatis.
• [P0] Status invoice: Draft, Terkirim, Dibayar Sebagian, Lunas, Jatuh Tempo (otomatis jika lewat tenggat dan belum lunas), Dibatalkan.
• [P0] Pratinjau dan unduh PDF dengan logo dan informasi kantor.
• [P0] Kirim invoice lewat email dari dalam aplikasi (PDF terlampir).
• [P0] Catat pembayaran manual: tanggal, jumlah, metode (transfer, tunai, lainnya), dan catatan. Mendukung pembayaran sebagian.
• [P0] Daftar invoice dengan filter status, klien, dan rentang tanggal.
• [P1] Buat invoice langsung dari tugas (lihat 6.4).
• [P1] Duplikat invoice, katalog item/jasa, link publik untuk melihat invoice, dan pengingat email otomatis sebelum/sesudah jatuh tempo.

Aturan bisnis:
• Nomor invoice unik per workspace dan tidak boleh dipakai ulang.
• Invoice yang sudah berstatus Terkirim tidak dapat diedit; koreksi dilakukan dengan membatalkan lalu membuat invoice baru.
• Sisa tagihan = total invoice dikurangi total pembayaran yang tercatat; status Lunas otomatis saat sisa tagihan nol.
• Invoice dari tugas menyimpan tautan ke tugas asal; perubahan pada tugas tidak boleh mengubah invoice yang sudah terkirim.

6.4 Task Management
• [P0] Tambah, ubah, hapus tugas: judul, deskripsi, penanggung jawab, tenggat, prioritas (Rendah/Sedang/Tinggi), dan status (To Do, In Progress, Selesai).
• [P0] Tautkan tugas ke klien (opsional).
• [P0] Dua tampilan: daftar dan papan Kanban dengan drag & drop antar status.
• [P0] Filter berdasarkan penanggung jawab, klien, status, dan tenggat; tampilan khusus Tugas Saya.
• [P0] Komentar pada tugas.
• [P0] Notifikasi email saat ditugaskan dan satu hari sebelum tenggat.
• [P1] Checklist/subtugas, lampiran file, dan tautan tugas ke invoice.
• [P1] Buat invoice langsung dari halaman detail tugas (pola Salesforce: pekerjaan menjadi sumber dokumen penagihan).

Aturan bisnis pembuatan invoice dari tugas:
• Tombol "Buat Invoice" hanya aktif jika tugas memiliki klien.
• Item invoice terisi otomatis dari judul dan deskripsi tugas; jumlah dan harga satuan tetap dapat diubah sebelum invoice dikirim.
• Invoice yang dibuat dari tugas tersimpan sebagai invoice Draft dan menautkan `taskId`; satu tugas boleh menghasilkan lebih dari satu invoice (penagihan bertahap).
• Detail tugas menampilkan daftar invoice terkait beserta status dan totalnya.
• Tautan tugas hanya informatif: menghapus atau menutup tugas tidak menghapus invoice yang sudah terbit.

6.5 Dashboard
• [P0] Untuk Owner/Admin: jumlah klien aktif, invoice belum dibayar (jumlah dan nominal), invoice jatuh tempo, pembayaran yang diterima bulan ini, serta tugas yang terlambat.
• [P0] Untuk Member: tugas hari ini dan tugas yang terlambat.
• [P1] Aktivitas terbaru di workspace.

6.6 Tanda Tangan Elektronik via Link
Tujuan: klien dapat menyetujui/menandatangani invoice lewat satu link yang dibagikan, tanpa akun, tanpa login, dan tanpa scan dokumen.

Kebutuhan:
• [P1] Owner/Admin membuat permintaan tanda tangan dari invoice yang sudah terkirim. Satu invoice memiliki paling banyak satu link aktif.
• [P1] Sistem membuat token acak (minimal 256-bit) dan membentuk link publik unik, misalnya /sign/<token>. Link hanya ditampilkan sekali saat dibuat dan dapat dibagikan lewat email atau chat.
• [P1] Link memiliki masa berlaku (default 7 hari) dan dapat dicabut kapan saja oleh Owner/Admin. Membuat link baru otomatis mencabut link lama.
• [P1] Halaman publik menampilkan: identitas kantor, nomor invoice, klien, tanggal, total, dan pratinjau PDF. Tidak ada data workspace lain yang dapat diakses dari halaman ini.
• [P1] Klien mengisi nama penanda tangan, email (opsional), gambar tanda tangan (kanvas atau unggah), dan mencentang pernyataan persetujuan sebelum mengirim.
• [P1] Setelah dikirim: dokumen PDF final diberi tanda tangan, nama, waktu, dan hash dokumen; status tanda tangan menjadi Signed; PDF final dapat diunduh klien dan tim.
• [P1] Notifikasi email ke pembuat link saat dokumen ditandatangani, ditolak, atau link kedaluwarsa.
• [P2] Verifikasi identitas tambahan (OTP email/WhatsApp) sebelum tanda tangan.
• [P2] Tanda tangan berurutan untuk beberapa penanda tangan.
• [P2] Tanda tangan untuk dokumen selain invoice (mis. BAST, penawaran).
• [P2] Tanda tangan tersertifikasi PSrE.

Aturan bisnis:
• Tanda tangan tidak mengubah status pembayaran invoice. Invoice tetap mengikuti aturan 6.3.
• Invoice berstatus Draft atau Dibatalkan tidak dapat ditandatangani.
• Satu link hanya dapat dipakai untuk satu tanda tangan; setelah Signed/Declined/Expired/Revoked, link tidak dapat dipakai lagi.
• Token disimpan sebagai hash, bukan teks asli; link asli tidak dapat ditampilkan ulang setelah dibuat.
• Setiap perubahan status tanda tangan dicatat di ActivityLog: waktu, IP, user-agent, dan hash dokumen.
• Jika invoice dibatalkan, link aktif otomatis dicabut.

7. Alur Pengguna Utama
Onboarding: daftar → buat workspace → isi profil kantor → undang tim → tambah klien pertama.

Klien sampai pembayaran: tambah klien → buat tugas dan tautkan ke klien → tugas selesai → buat invoice (langsung dari tugas atau dari halaman klien) → kirim ke klien → bagikan link tanda tangan → klien menandatangani → catat pembayaran → status Lunas.

Harian staf: login → buka Tugas Saya → ubah status atau beri komentar → selesai.

Klien menandatangani: buka link → periksa invoice → isi nama dan tanda tangan → setujui → unduh PDF final.

8. User Stories & Kriteria Penerimaan
1. Sebagai Admin, saya ingin menambah klien beserta kontaknya agar data klien tersimpan rapi.
   ◦ Klien tersimpan dengan minimal nama dan satu kontak.
   ◦ Klien muncul di daftar dan bisa dicari berdasarkan nama.
2. Sebagai Admin, saya ingin membuat invoice dari halaman klien agar penagihan cepat.
   ◦ Subtotal, diskon, pajak, dan total terhitung otomatis dan akurat.
   ◦ Nomor invoice terisi otomatis dan unik.
   ◦ Invoice dapat diunduh sebagai PDF yang memuat logo dan info kantor.
3. Sebagai Admin, saya ingin mencatat pembayaran agar status tagihan selalu akurat.
   ◦ Pembayaran sebagian mengubah status menjadi Dibayar Sebagian dan menampilkan sisa tagihan.
   ◦ Total pembayaran yang sama dengan total invoice mengubah status menjadi Lunas.
4. Sebagai Member, saya ingin melihat tugas saya agar tahu prioritas hari ini.
   ◦ Tugas Saya hanya menampilkan tugas yang ditugaskan kepada saya, diurutkan berdasarkan tenggat.
   ◦ Mengubah status di Kanban tersimpan langsung.
5. Sebagai Owner, saya ingin melihat ringkasan di dashboard agar tahu kondisi kantor sekilas.
   ◦ Dashboard menampilkan angka invoice belum dibayar, jatuh tempo, dan tugas terlambat sesuai data terbaru.
6. Sebagai Admin, saya ingin membuat invoice langsung dari tugas agar pekerjaan dan tagihan tidak lepas.
   ◦ Tombol "Buat Invoice" menghasilkan invoice Draft dengan klien dan item terisi dari tugas.
   ◦ Invoice yang dihasilkan tercatat sebagai invoice terkait pada detail tugas.
   ◦ Satu tugas dapat memiliki lebih dari satu invoice.
7. Sebagai Admin, saya ingin membagikan link agar klien menandatangani invoice tanpa akun.
   ◦ Link dapat dibuka tanpa login dan hanya menampilkan invoice yang bersangkutan.
   ◦ Setelah ditandatangani, status tanda tangan berubah dan PDF final dapat diunduh.
   ◦ Link kedaluwarsa setelah masa berlaku habis atau setelah dicabut.

9. Model Data (Garis Besar)
• Workspace: nama, logo, alamat, info rekening, pengaturan nomor invoice dan pajak default.
• User & Membership: user terhubung ke workspace dengan peran tertentu.
• Client: milik satu workspace; punya banyak Contact dan banyak ClientNote.
• Invoice: milik satu workspace dan satu Client; punya banyak InvoiceItem dan banyak Payment; opsional tertaut ke satu Task asal.
• Task: milik satu workspace; opsional terhubung ke Client; punya satu penanggung jawab dan banyak TaskComment; dapat menghasilkan banyak Invoice.
• SignatureRequest: milik satu Invoice; menyimpan hash token, masa berlaku, status, identitas penanda tangan, IP/user-agent, gambar tanda tangan, dan PDF final bertanda tangan beserta hash-nya.
• ActivityLog: mencatat aksi penting (terutama perubahan status invoice, pembayaran, dan tanda tangan).

Setiap tabel membawa workspace_id agar isolasi data antar kantor terjamin. Data publik (link tanda tangan) diakses lewat token, bukan workspace_id dari klien.

10. Kebutuhan Non-Fungsional
• Keamanan: HTTPS, password di-hash, kontrol akses berbasis peran, isolasi data per workspace, dan backup harian.
• Keamanan link tanda tangan: token acak minimal 256-bit, disimpan sebagai hash, masa berlaku terbatas, dapat dicabut, rate limit per token/IP, halaman tidak diindeks mesin pencari, dan tidak ada enumerasi invoice.
• Performa: halaman utama termuat di bawah 2 detik untuk skala hingga sekitar 5.000 klien dan 10.000 invoice per workspace.
• Ketersediaan: target 99,5%.
• Perangkat: responsif di desktop dan browser mobile.
• Bahasa & mata uang: Bahasa Indonesia dan Rupiah (IDR) sebagai default; struktur disiapkan agar bisa menambah bahasa dan mata uang kemudian.
• Privasi: pemilik workspace dapat mengekspor dan menghapus datanya. Perlu ditinjau terhadap UU Pelindungan Data Pribadi jika pasar utamanya Indonesia.
• Audit: perubahan status invoice, pembayaran, dan tanda tangan tercatat siapa dan kapan, termasuk bukti teknis tanda tangan (IP, user-agent, hash dokumen).

11. Metrik Keberhasilan
Target awal berikut disesuaikan setelah fase beta:
• Aktivasi: 60% workspace baru menambah minimal 1 klien dan 1 tugas dalam 7 hari pertama.
• Nilai inti: 40% workspace mengirim invoice pertama dalam 14 hari.
• Efisiensi: waktu median membuat invoice kurang dari 2 menit.
• Retensi: 50% workspace tetap aktif mingguan pada minggu ke-4.
• Kepuasan: NPS minimal 30 dari pengguna beta.
• Tanda tangan: 60% invoice terkirim ditandatangani lewat link dalam 7 hari.

12. Model Bisnis (Usulan Awal)
• Uji coba gratis 14 hari tanpa kartu kredit.
• Langganan bulanan atau tahunan per workspace dengan batas jumlah pengguna (misalnya paket kecil hingga 5 pengguna dan paket tim hingga 20 pengguna).
• Harga ditentukan setelah validasi dengan calon pengguna beta.

13. Usulan Teknis (Ringkas)
• Aplikasi web responsif dengan arsitektur multi-tenant (satu database, pemisahan lewat workspace_id).
• Database relasional (misalnya PostgreSQL), pembuatan PDF di server, dan layanan email transaksional.
• Halaman tanda tangan publik memakai token acak (disimpan sebagai hash) dan dibuat terpisah dari sesi login.
• Penyimpanan gambar tanda tangan dan PDF final di object storage; hash dokumen (SHA-256) disimpan di database.
• Stack frontend dan backend mengikuti keahlian tim; yang penting API-nya rapi agar mudah dikembangkan ke integrasi dan mobile nanti.

14. Rencana Rilis (Estimasi Kasar)
Asumsi tim kecil: 2–3 developer dan 1 desainer.
• Fase 0 (1–2 minggu): finalisasi PRD, wireframe, dan desain UI dasar.
• Fase 1 (3–4 minggu): akun, workspace, peran, dan modul klien.
• Fase 2 (3 minggu): invoicing, PDF, email, dan pencatatan pembayaran.
• Fase 3 (3 minggu): task management, notifikasi, pembuatan invoice dari tugas, dan tanda tangan via link.
• Fase 4 (2 minggu): dashboard, perapian, dan QA.
• Beta tertutup (2–4 minggu): uji dengan 5–10 kantor, lalu perbaikan sebelum rilis publik.
Total sekitar 3–4 bulan sampai beta siap.

15. Risiko & Asumsi
Risiko:
• Scope creep: kantor akan meminta fitur akuntansi, pajak, dan laporan. Mitigasi: pegang daftar non-tujuan.
• Format invoice berbeda-beda: terutama soal pajak. Mitigasi: pajak dan nomor invoice dapat diatur; integrasi pajak resmi di luar MVP.
• Tim enggan pindah dari WhatsApp/Excel: Mitigasi: import CSV, onboarding singkat, dan tampilan Tugas Saya yang sangat sederhana.
• Email invoice masuk spam: Mitigasi: konfigurasi SPF/DKIM dan domain pengirim yang benar.
• Keabsahan tanda tangan elektronik sederhana dipertanyakan klien: Mitigasi: sediakan bukti audit (waktu, IP, hash dokumen), pernyataan persetujuan yang jelas, dan opsi cetak PDF final; sertifikasi PSrE masuk fase berikutnya.
• Link tanda tangan tersebar ke pihak yang salah: Mitigasi: masa berlaku pendek, dapat dicabut, rate limit, dan (fase berikutnya) OTP.

Asumsi:
• Pasar awal adalah Indonesia (bahasa Indonesia, mata uang Rupiah).
• Pembayaran dicatat manual oleh pengguna; belum ada payment gateway.
• Satu workspace mewakili satu kantor.
• Tanda tangan invoice adalah persetujuan komersial, bukan pengganti tanda tangan tersertifikasi.

16. Pertanyaan Terbuka
1. Segmen mana yang paling dulu dibidik (agensi, konsultan, kontraktor, lainnya)? Ini memengaruhi format invoice dan istilah di aplikasi.
2. Apakah Member boleh melihat invoice (hanya baca), atau sepenuhnya disembunyikan?
3. Apakah perlu format khusus seperti PPN, e-Faktur, atau materai di invoice?
4. Harga per pengguna atau per workspace?
5. Apakah notifikasi lewat WhatsApp diperlukan sejak awal, atau cukup email?
6. Apakah satu klien perlu dipecah menjadi beberapa proyek (entitas Proyek) di fase berikutnya?
7. Objek tanda tangan: cukup invoice, atau perlu BAST/penawaran sejak awal?
8. Apakah perlu verifikasi OTP sebelum tanda tangan, atau nama + checkbox sudah cukup?
9. Apakah tanda tangan wajib menggunakan sertifikat PSrE untuk segmen tertentu?
10. Satu tugas boleh menghasilkan berapa invoice (satu vs banyak)?

17. Fase Berikutnya (Di Luar MVP)
• Payment gateway dan link pembayaran online.
• Invoice berulang (recurring) dan penawaran/quotation.
• Pipeline deal dan pelacakan prospek.
• Integrasi WhatsApp, Google Calendar, dan email.
• Laporan dan ekspor lanjutan, serta API publik.
• Aplikasi mobile dan dukungan multi-mata uang.
• Tanda tangan multi-penanda tangan berurutan, OTP, dan sertifikasi PSrE.
• Tanda tangan untuk BAST, kontrak, dan dokumen lain di luar invoice.
