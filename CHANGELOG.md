# Changelog

Format changelog mengikuti prinsip perubahan yang mudah dipahami pengguna. Tanggal menggunakan zona waktu Asia/Jakarta.

## 2026-10-02

### Added

- Jadwal transaksi rutin mingguan atau bulanan untuk pemasukan dan pengeluaran.
- Forecast saldo sampai tanggal gajian berdasarkan saldo saat ini dan jadwal rutin aktif.
- Rollover anggaran untuk membawa sisa anggaran bulan sebelumnya.
- Pemilih periode laporan serta insight perubahan kategori pengeluaran dibanding bulan sebelumnya.
- Kontribusi tujuan keuangan yang mencatat akun sumber dan riwayat kontribusi.
- Pembayaran utang/piutang parsial yang mencatat transaksi kas dan memperbarui status pelunasan.
- Rekonsiliasi saldo untuk membandingkan saldo aktual rekening dengan catatan aplikasi.
- Pagination riwayat transaksi dan API edit/hapus untuk data utama.
- Tes otomatis untuk saldo, transfer, rollover, forecast, insight, dan validasi transaksi.

### Changed

- Konektor database dipindahkan dari Neon serverless ke driver PostgreSQL standar untuk Supabase.
- Saldo dashboard dan akun dihitung dari saldo awal serta seluruh riwayat transaksi.
- Anggaran memakai total transaksi pengeluaran untuk periode yang dipilih.
- Validasi server diperketat untuk data finansial yang baru dibuat atau diperbarui.
- README diperluas dengan penjelasan tujuan proyek, fitur, setup, perintah, model perhitungan, dan batasan operasional.
