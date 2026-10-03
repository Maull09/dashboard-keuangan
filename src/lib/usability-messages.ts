import type { Locale } from "./finance"

const en = {
  closeDialog: "Close dialog",
  recordScheduleHint:
    "This creates an actual transaction today and changes the selected account balance. Confirm that the payment has happened.",
  retry: "Try again",
  refresh: "Refresh",
  refreshing: "Updating…",
  updated: "Last updated",
  loading: "Loading your records…",
  savingChanges: "Saving changes…",
  deleting: "Deleting…",
  requiredHint: "Required fields are marked with *.",
  amountHint: "Enter a whole amount in IDR, without separators.",
  optional: "Optional",
  description: "Description",
  name: "Name",
  accountType: "Account type",
  openingBalanceHint:
    "Your balance before the first transaction. Leave empty for zero.",
  networkError:
    "Could not connect. Check your connection and try again. Your input is still here.",
  serviceUnavailable:
    "Your records could not be loaded. Try again in a moment. If this continues, check the database connection.",
  invalidInput:
    "Check the amount, date, and selected account, then try again. Your input is still here.",
  recordConflict:
    "This record conflicts with existing data. Check for duplicates or linked records before trying again.",
  recordMissing:
    "This record is no longer available. Refresh the list and try again.",
  accountSaved: "Account added.",
  transactionSaved: "Transaction saved. Balances have been updated.",
  transactionDeleted: "Transaction deleted. Balances have been updated.",
  budgetSaved: "Budget saved.",
  goalSaved: "Goal added.",
  contributionSaved: "Contribution recorded.",
  debtSaved: "Debt or receivable added.",
  paymentSaved: "Payment recorded. Your account balance has been updated.",
  scheduleSaved: "Recurring schedule saved.",
  scheduleRecorded: "Transaction recorded from the schedule.",
  scheduleDeleted: "Schedule deleted. Existing transactions are unchanged.",
  confirmDelete: "Delete this record?",
  irreversible: "This cannot be undone. Review the record before deleting it.",
  deleteScheduleHint:
    "Deleting a schedule stops future entries. Transactions already recorded will stay in your history.",
  transactionDeleteHint:
    "This removes the transaction and recalculates balances, budgets, and reports. This cannot be undone.",
  transferHint:
    "Move money between two different accounts. Your total balance stays the same.",
  transferNeedsAccounts:
    "A transfer needs two accounts. Add another account first.",
  selectRequired: "Complete all required fields before saving.",
  resetFilters: "Clear filters",
  filters: "Filter transactions",
  results: "{count} matching transactions",
  matchingIncome: "Matching income",
  matchingExpense: "Matching expenses",
  matchingNet: "Matching net cash flow",
  filtersHint: "Filters search all transactions, including other pages.",
  invalidDateRange: "The end date must be on or after the start date.",
  noTransactions: "Your transaction history starts here",
  noTransactionsHint:
    "Record your first income or expense to see where your money goes.",
  noMatchesHint:
    "Try another search or clear the filters to see all transactions.",
  search: "Search",
  allTime: "All time",
  thisMonth: "This month",
  amountIdr: "Amount (IDR)",
  startHere: "Set up your money view",
  startHereHint:
    "Add an account with its opening balance, then record your first transaction.",
  startAccount: "1. Add an account",
  startTransaction: "2. Record a transaction",
  viewTransactions: "View transactions",
  viewBudget: "Review budgets",
  noAccounts: "No accounts yet",
  accountHelp: "Add your bank, cash, or wallet balance to get started.",
  overview: "Overview",
  moneyIn: "Money in",
  moneyOut: "Money out",
  personalFinance: "Personal finance",
  skipToContent: "Skip to content",
  currentPeriod: "Current reporting month",
  navigate: "Main navigation",
  shortMillion: "M",
  balance: "Balance",
  expenses: "Expenses",
  period: "Period",
  help: "Quick guide",
  helpDescription: "A few practical steps for keeping your records accurate.",
  helpAccounts: "Start with accounts",
  helpAccountsBody:
    "Add each bank, cash, or wallet account. Use the balance just before you begin recording transactions as its opening balance.",
  helpTransactions: "Record money movement",
  helpTransactionsBody:
    "Use Income for money received, Expense for spending, and Transfer for moving money between your own accounts. Edit a transaction to correct a mistake.",
  helpBudget: "Read your budget",
  helpBudgetBody:
    "Budget use comes from expenses in the selected month. Rollover carries only the unused budget from the previous month.",
  helpGoals: "Understand contributions",
  helpGoalsBody:
    "A contribution reserves money toward a goal. It does not move money out of its source account.",
  helpPlanning: "Use forecasts carefully",
  helpPlanningBody:
    "Forecasts estimate your balance from active recurring schedules. They do not record transactions automatically. Use Record now once an actual payment happens.",
  helpReconcile: "Check your balance",
  helpReconcileBody:
    "Compare an account against your real statement. Reconciliation records the difference without changing its balance.",
  done: "Got it",
  noGoals: "What are you saving for?",
  noGoalsHint:
    "Add a goal, target amount, and date. Track contributions as you save.",
  progress: "Progress",
  daysLeft: "{count} days left",
  daysOverdue: "{count} days overdue",
  contributeAmount: "Contribution amount (IDR)",
  noBudgetHint:
    "Set a limit for a spending category. Recorded expenses update it automatically.",
  paidHint: "Payments create an income or expense in the account you choose.",
  dueDate: "Due date",
  noDebtsHint:
    "Record what you owe or what others owe you, then track each payment.",
  payDay: "Payday",
  startDate: "Start date",
  lastRecorded: "Last recorded",
  notRecorded: "Not recorded yet",
  forecastHint:
    "An estimate, not a guarantee. Unscheduled spending is not included.",
  noSchedulesHint:
    "Add a salary, bill, or subscription to include it in your forecast.",
  cash: "Cash",
  bank: "Bank",
  investment: "Investment",
  ewallet: "E-wallet",
  other: "Other",
  "Gaji Utama": "Salary",
  Freelance: "Freelance",
  Investasi: "Investments",
  Bonus: "Bonus",
  Lainnya: "Other",
  Makanan: "Food",
  Transportasi: "Transport",
  Hiburan: "Entertainment",
  Belanja: "Shopping",
  Tagihan: "Bills",
  Kesehatan: "Health",
  Pendidikan: "Education",
  "Transfer antar akun": "Account transfer",
  reconcileHint:
    "This comparison saves a record; it does not adjust your balance.",
} as const

const id: Record<keyof typeof en, string> = {
  closeDialog: "Tutup dialog",
  recordScheduleHint:
    "Ini membuat transaksi aktual hari ini dan mengubah saldo akun pilihan. Pastikan pembayaran benar-benar telah terjadi.",
  retry: "Coba lagi",
  refresh: "Perbarui",
  refreshing: "Memperbarui…",
  updated: "Terakhir diperbarui",
  loading: "Memuat catatan Anda…",
  savingChanges: "Menyimpan perubahan…",
  deleting: "Menghapus…",
  requiredHint: "Kolom wajib ditandai dengan *.",
  amountHint: "Masukkan nominal bulat dalam IDR, tanpa pemisah angka.",
  optional: "Opsional",
  description: "Keterangan",
  name: "Nama",
  accountType: "Jenis akun",
  openingBalanceHint:
    "Saldo sebelum transaksi pertama. Kosongkan untuk saldo nol.",
  networkError:
    "Tidak dapat terhubung. Periksa koneksi lalu coba lagi. Isian Anda tetap tersimpan.",
  serviceUnavailable:
    "Catatan tidak dapat dimuat. Coba lagi sebentar. Jika berlanjut, periksa koneksi database.",
  invalidInput:
    "Periksa nominal, tanggal, dan akun yang dipilih, lalu coba lagi. Isian Anda tetap tersimpan.",
  recordConflict:
    "Catatan ini berbenturan dengan data yang ada. Periksa duplikasi atau catatan terkait sebelum mencoba lagi.",
  recordMissing:
    "Catatan ini sudah tidak tersedia. Perbarui daftar lalu coba lagi.",
  accountSaved: "Akun ditambahkan.",
  transactionSaved: "Transaksi disimpan. Saldo telah diperbarui.",
  transactionDeleted: "Transaksi dihapus. Saldo telah diperbarui.",
  budgetSaved: "Anggaran disimpan.",
  goalSaved: "Tujuan ditambahkan.",
  contributionSaved: "Kontribusi dicatat.",
  debtSaved: "Utang atau piutang ditambahkan.",
  paymentSaved: "Pembayaran dicatat. Saldo akun telah diperbarui.",
  scheduleSaved: "Jadwal rutin disimpan.",
  scheduleRecorded: "Transaksi dari jadwal berhasil dicatat.",
  scheduleDeleted:
    "Jadwal dihapus. Transaksi yang telah dicatat tetap tersimpan.",
  confirmDelete: "Hapus catatan ini?",
  irreversible:
    "Tindakan ini tidak dapat dibatalkan. Periksa catatan sebelum menghapusnya.",
  deleteScheduleHint:
    "Menghapus jadwal menghentikan pencatatan berikutnya. Transaksi yang sudah dicatat tetap ada di riwayat.",
  transactionDeleteHint:
    "Transaksi akan dihapus dan saldo, anggaran, serta laporan dihitung ulang. Tindakan ini tidak dapat dibatalkan.",
  transferHint:
    "Pindahkan uang antara dua akun berbeda. Total saldo Anda tetap sama.",
  transferNeedsAccounts:
    "Transfer membutuhkan dua akun. Tambahkan akun lain terlebih dahulu.",
  selectRequired: "Lengkapi semua kolom wajib sebelum menyimpan.",
  resetFilters: "Hapus filter",
  filters: "Filter transaksi",
  results: "{count} transaksi sesuai",
  matchingIncome: "Pemasukan sesuai filter",
  matchingExpense: "Pengeluaran sesuai filter",
  matchingNet: "Arus kas bersih sesuai filter",
  filtersHint: "Filter mencari seluruh transaksi, termasuk di halaman lain.",
  invalidDateRange: "Tanggal akhir harus sama atau setelah tanggal awal.",
  noTransactions: "Mulai riwayat transaksi Anda",
  noTransactionsHint:
    "Catat pemasukan atau pengeluaran pertama untuk melihat pergerakan uang Anda.",
  noMatchesHint:
    "Coba pencarian lain atau hapus filter untuk melihat semua transaksi.",
  search: "Cari",
  allTime: "Semua waktu",
  thisMonth: "Bulan ini",
  amountIdr: "Nominal (IDR)",
  startHere: "Mulai pantau uang Anda",
  startHereHint:
    "Tambahkan akun beserta saldo awal, lalu catat transaksi pertama Anda.",
  startAccount: "1. Tambahkan akun",
  startTransaction: "2. Catat transaksi",
  viewTransactions: "Lihat transaksi",
  viewBudget: "Lihat anggaran",
  noAccounts: "Belum ada akun",
  accountHelp:
    "Tambahkan saldo bank, tunai, atau dompet digital untuk memulai.",
  overview: "Ringkasan",
  moneyIn: "Uang masuk",
  moneyOut: "Uang keluar",
  personalFinance: "Keuangan pribadi",
  skipToContent: "Langsung ke konten",
  currentPeriod: "Bulan laporan saat ini",
  navigate: "Navigasi utama",
  shortMillion: "jt",
  balance: "Saldo",
  expenses: "Pengeluaran",
  period: "Periode",
  help: "Panduan singkat",
  helpDescription:
    "Langkah praktis untuk menjaga catatan keuangan tetap akurat.",
  helpAccounts: "Mulai dari akun",
  helpAccountsBody:
    "Tambahkan akun bank, tunai, atau dompet digital. Gunakan saldo tepat sebelum mulai mencatat transaksi sebagai saldo awal.",
  helpTransactions: "Catat pergerakan uang",
  helpTransactionsBody:
    "Gunakan Pemasukan untuk uang diterima, Pengeluaran untuk belanja, dan Transfer untuk perpindahan antar akun milik Anda. Ubah transaksi untuk memperbaiki kesalahan.",
  helpBudget: "Baca anggaran Anda",
  helpBudgetBody:
    "Pemakaian anggaran berasal dari pengeluaran pada bulan pilihan. Rollover hanya membawa sisa anggaran dari bulan sebelumnya.",
  helpGoals: "Pahami kontribusi",
  helpGoalsBody:
    "Kontribusi mengalokasikan uang untuk tujuan. Uang tidak berpindah dari akun sumber.",
  helpPlanning: "Gunakan estimasi saldo",
  helpPlanningBody:
    "Estimasi memakai jadwal rutin aktif dan tidak otomatis mencatat transaksi. Gunakan Catat sekarang ketika pembayaran benar-benar terjadi.",
  helpReconcile: "Periksa saldo",
  helpReconcileBody:
    "Bandingkan akun dengan rekening asli. Rekonsiliasi mencatat selisih tanpa mengubah saldo.",
  done: "Mengerti",
  noGoals: "Apa tujuan tabungan Anda?",
  noGoalsHint:
    "Tambahkan tujuan, nominal target, dan tanggal. Pantau kontribusi saat menabung.",
  progress: "Progres",
  daysLeft: "Sisa {count} hari",
  daysOverdue: "Terlambat {count} hari",
  contributeAmount: "Nominal kontribusi (IDR)",
  noBudgetHint:
    "Tetapkan batas kategori belanja. Pengeluaran tercatat memperbaruinya otomatis.",
  paidHint:
    "Pembayaran membuat transaksi pemasukan atau pengeluaran di akun pilihan.",
  dueDate: "Tanggal jatuh tempo",
  noDebtsHint:
    "Catat kewajiban Anda atau uang yang dipinjam orang lain, lalu pantau pembayarannya.",
  payDay: "Tanggal gajian",
  startDate: "Tanggal mulai",
  lastRecorded: "Terakhir dicatat",
  notRecorded: "Belum pernah dicatat",
  forecastHint:
    "Ini estimasi, bukan kepastian. Belanja di luar jadwal belum termasuk.",
  noSchedulesHint:
    "Tambahkan gaji, tagihan, atau langganan untuk menghitung estimasi saldo.",
  cash: "Tunai",
  bank: "Bank",
  investment: "Investasi",
  ewallet: "Dompet digital",
  other: "Lainnya",
  "Gaji Utama": "Gaji utama",
  Freelance: "Freelance",
  Investasi: "Investasi",
  Bonus: "Bonus",
  Lainnya: "Lainnya",
  Makanan: "Makanan",
  Transportasi: "Transportasi",
  Hiburan: "Hiburan",
  Belanja: "Belanja",
  Tagihan: "Tagihan",
  Kesehatan: "Kesehatan",
  Pendidikan: "Pendidikan",
  "Transfer antar akun": "Transfer antar akun",
  reconcileHint:
    "Perbandingan ini menyimpan catatan, tanpa menyesuaikan saldo.",
}

export const usabilityMessages: Record<Locale, Record<string, string>> = {
  en,
  id,
}
