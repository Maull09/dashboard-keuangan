# Dashboard Keuangan

Dashboard Keuangan adalah aplikasi web untuk mencatat, memahami, dan merencanakan keuangan pribadi dalam Rupiah (IDR). Aplikasi ini membantu pengguna melihat saldo yang tersedia, mengelola arus kas harian, membatasi pengeluaran dengan anggaran, serta memantau tujuan dan kewajiban finansial.

Fokus aplikasi adalah satu sumber data yang konsisten: saldo, anggaran, laporan, forecast, dan status pembayaran dihitung dari catatan transaksi dan riwayat terkait—bukan angka ringkasan yang harus diperbarui secara manual.

## Fitur

### Pencatatan dan saldo

- Kelola akun tunai, bank, e-wallet, investasi, serta saldo awalnya.
- Catat pemasukan, pengeluaran, dan transfer antar akun.
- Ubah atau hapus transaksi yang keliru.
- Telusuri riwayat transaksi dengan pencarian, filter jenis, akun, dan tanggal; daftar transaksi memakai pagination.
- Rekonsiliasi saldo catatan aplikasi dengan saldo aktual pada rekening.

### Anggaran dan laporan

- Buat anggaran bulanan per kategori pengeluaran.
- Penggunaan anggaran dihitung otomatis dari transaksi pengeluaran pada periode tersebut.
- Aktifkan rollover untuk membawa sisa anggaran ke bulan berikutnya.
- Lihat laporan pemasukan, pengeluaran, distribusi kategori, dan insight perubahan kategori dibanding bulan sebelumnya.

### Perencanaan keuangan

- Tetapkan tujuan keuangan dan catat kontribusi dari akun sumber yang dipilih.
- Catat utang atau piutang beserta pembayaran parsial dan riwayat pelunasannya.
- Buat transaksi rutin mingguan atau bulanan, misalnya gaji, listrik, internet, cicilan, atau langganan.
- Gunakan forecast kas untuk memperkirakan saldo hingga tanggal gajian berdasarkan jadwal rutin aktif.

## Teknologi

- [Next.js 15](https://nextjs.org/) dan React 19
- TypeScript
- Tailwind CSS dan komponen Radix UI
- PostgreSQL di Supabase
- Drizzle ORM dan Drizzle Kit
- Recharts untuk visualisasi
- Vitest untuk tes perhitungan finansial

## Prasyarat

- Node.js 20 atau lebih baru
- npm
- Project database Supabase

## Menjalankan secara lokal

1. Clone repository dan masuk ke folder proyek.

   ```bash
   git clone <URL_REPOSITORY>
   cd dashboard-keuangan
   ```

2. Instal dependensi.

   ```bash
   npm install
   ```

3. Buat project di [Supabase](https://supabase.com/dashboard), lalu salin connection string dari **Connect**. Buat file `.env` pada root proyek dengan URL **Transaction pooler**. Pilihan ini direkomendasikan ketika aplikasi berjalan sebagai serverless function.

   ```env
   DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[POOLER-HOST]:6543/postgres?sslmode=require
   ```

   Gunakan nilai persis dari dashboardâ€”host dan username pooler tidak dapat disusun sendiri. Pastikan karakter khusus pada password telah di-URL-encode. Jangan pernah gunakan prefix `NEXT_PUBLIC_` untuk URL ini.

4. Terapkan migrasi database.

   ```bash
   npm run db:migrate
   ```

   Untuk migrasi, ganti sementara `DATABASE_URL` dengan URL **Direct connection** dari Supabase Connect (port `5432`), lalu kembalikan URL transaction pooler setelah selesai. Backup database terlebih dahulu jika database tersebut sudah berisi data. Migrasi awal mempertahankan transaksi lama dengan menempatkannya pada akun `Akun belum dikategorikan`; pindahkan transaksi itu ke akun yang benar melalui halaman Transaksi.

5. Jalankan aplikasi.

   ```bash
   npm run dev
   ```

6. Buka [http://localhost:3000](http://localhost:3000).

## Perintah yang tersedia

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan dengan Turbopack. |
| `npm run build` | Membuat dan memverifikasi build produksi. |
| `npm run start` | Menjalankan build produksi. |
| `npm test` | Menjalankan tes perhitungan finansial dan validasi. |
| `npm run db:generate` | Membuat berkas migrasi setelah skema Drizzle berubah. |
| `npm run db:migrate` | Menerapkan migrasi yang tersedia ke database. |

## Alur penggunaan singkat

1. Tambahkan akun dan masukkan saldo awalnya.
2. Catat transaksi pemasukan, pengeluaran, atau transfer.
3. Buat anggaran bulanan untuk kategori yang ingin dikendalikan.
4. Tambahkan tujuan, utang/piutang, atau jadwal rutin bila diperlukan.
5. Gunakan Dashboard untuk memantau saldo dan arus kas; gunakan Laporan untuk memilih periode dan melihat perubahan pengeluaran.
6. Sebelum tanggal gajian, buka Rencana Keuangan untuk menghitung forecast saldo.

## Struktur proyek

```text
src/
├── app/                 # Halaman Next.js dan API route
├── components/          # Komponen antarmuka aplikasi
├── db/                  # Koneksi dan definisi skema Drizzle
└── lib/                 # Perhitungan finansial, tipe, dan validasi
drizzle/                 # Riwayat migrasi database
docs/                    # Panduan pengembangan dan troubleshooting
```

## Model data dan prinsip perhitungan

- Transaksi adalah catatan utama arus kas.
- Saldo akun = saldo awal + pemasukan - pengeluaran - transfer keluar + transfer masuk.
- Total saldo dashboard tidak mengubah nilai saat transfer antar akun terjadi.
- Anggaran hanya menghitung transaksi pengeluaran pada periode anggaran yang dipilih.
- Kontribusi tujuan adalah alokasi dari sebuah akun; kontribusi tersebut tidak otomatis mengurangi saldo, karena uang tetap berada pada akun sumber sampai dicatat sebagai pengeluaran atau transfer.
- Pembayaran utang/piutang membuat transaksi kas agar saldo akun dan riwayat pelunasan tetap selaras.

## Pengujian dan kualitas

Jalankan pemeriksaan berikut sebelum membuat perubahan besar:

```bash
npx tsc --noEmit
npm test
npm run build
```

Tes saat ini melindungi perhitungan saldo termasuk transfer, rollover anggaran, forecast, insight kategori, dan validasi transaksi.

## Dokumentasi tambahan

- [Panduan pengembangan dan troubleshooting](docs/development.md)
- [Riwayat perubahan](CHANGELOG.md)
- [Checklist pekerjaan](todo.md)

## Batasan saat ini

- Aplikasi belum memiliki autentikasi atau pemisahan data per pengguna; jangan publikasikan aplikasi ke pengguna lain sebelum fitur tersebut tersedia.
- Integrasi bank otomatis dan impor/ekspor CSV belum tersedia.
- Migrasi database harus ditinjau dan dibackup sebelum diterapkan pada data finansial aktif. Gunakan URL direct connection Supabase untuk proses migrasi.
