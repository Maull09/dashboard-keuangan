# Panduan Pengembangan

## Prasyarat

- Node.js dan npm.
- Project database Supabase.

## Konfigurasi

Buat project di Supabase Dashboard. Pada menu **Connect**, salin URL connection yang sesuai dan buat `.env` pada root proyek:

```env
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[POOLER-HOST]:6543/postgres?sslmode=require
```

`DATABASE_URL` digunakan oleh `src/db/index.ts` untuk membuat koneksi database. Gunakan URL **Transaction pooler** untuk aplikasi yang berjalan secara serverless dan URL **Direct connection** untuk migrasi. Salin URL apa adanya dari Supabaseâ€”host dan username pooler tidak dapat ditebak dari region. Jangan commit file `.env` atau kredensial database, serta jangan gunakan prefix `NEXT_PUBLIC_` untuk variabel ini.

## Perintah Utama

```bash
npm install
npm run dev
npm run build
npm run db:generate
npm run db:migrate
```

`npm run dev` menjalankan aplikasi pengembangan di port yang ditampilkan Next.js. `npm run build` memverifikasi build produksi. `npm run db:generate` membuat migrasi dari perubahan skema, sedangkan `npm run db:migrate` menerapkan migrasi yang sudah ada.

## Database

Skema Drizzle berada di `src/db/schema.ts`, sedangkan berkas migrasi berada di `drizzle/`. Tinjau setiap perubahan skema dan migrasi sebelum menerapkannya ke database yang berisi data pengguna. Saat menjalankan `npm run db:migrate`, gunakan sementara URL **Direct connection** dari dialog Supabase Connect (port `5432`), lalu kembalikan URL transaction pooler untuk aplikasi.

Migrasi `0001_rare_blackheart.sql` menambahkan akun, saldo awal, transaksi transfer, serta periode anggaran. Untuk mempertahankan transaksi lama yang belum memiliki akun, migrasi membuat akun `Akun belum dikategorikan` dan menempatkan transaksi lama di sana. Setelah migrasi, pindahkan transaksi tersebut ke akun yang sebenarnya melalui fitur ubah transaksi.

Migrasi `0002_uneven_killer_shrike.sql` menambahkan jadwal rutin, kontribusi tujuan, cicilan utang/piutang, rekonsiliasi akun, dan pengaturan rollover anggaran. Backup database sebelum menjalankan kedua migrasi pada data yang sudah digunakan.

## Troubleshooting

- **Aplikasi gagal terhubung ke database:** pastikan `DATABASE_URL` tersedia di `.env`, URL tersebut berasal dari Supabase Connect, password telah di-URL-encode, dan koneksi memakai SSL.
- **Perubahan UI tidak terlihat:** pastikan server `npm run dev` berjalan, lalu muat ulang halaman. Hapus direktori `.next` hanya bila cache build terbukti menjadi penyebabnya.
- **Build gagal:** jalankan `npm install` untuk menyelaraskan dependensi dengan `package-lock.json`, kemudian ulangi `npm run build`.
- **Tes gagal:** jalankan `npm test` untuk melihat skenario perhitungan yang gagal.
- **Migrasi gagal:** pastikan `DATABASE_URL` sementara mengarah ke URL Direct connection Supabase dan database yang benar. Buat backup sebelum menjalankan migrasi pada database yang berisi data finansial.
