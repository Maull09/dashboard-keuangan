import type { Locale } from "./finance"

const en = {
  cashAfterEdit: "Available cash after saving in {account}",
  scheduleUnavailable:
    "This schedule has not started or has already ended. Review its start/end dates before recording a payment.",
  scheduleAlreadyRecorded:
    "Today's payment is already recorded. Review it in transaction history.",
  helpManage: "Update your records",
  helpManageBody:
    "Use Edit or Delete beside a record. Open Manage trades to correct stock trades. Contribution and payment histories preserve recorded amounts. Review the confirmation before permanently deleting a record.",
  saveChanges: "Save changes",
  accountUpdated: "Account updated.",
  accountDeleted: "Account deleted.",
  editAccount: "Edit account",
  editAccountHint:
    "Opening balance is your balance before the first transaction. Editing it recalculates the account's balance history.",
  deleteAccountHint:
    "Permanently delete this account. Review linked financial records first. Deletion is available once the account is free of linked records.",
  editBudget: "Edit budget",
  budgetUpdated: "Budget updated.",
  budgetDeleted: "Budget deleted.",
  editBudgetHint:
    "Update the monthly limit or rollover setting. Recorded expenses stay in your history.",
  deleteBudgetHint:
    "Permanently delete this budget and its rollover setting. Transactions stay unchanged; later rollover amounts may change.",
  editGoal: "Edit goal",
  goalUpdated: "Goal updated.",
  goalDeleted: "Goal deleted.",
  editGoalHint:
    "Update the goal's details and target. Set a target at least equal to the saved amount. Contributions stay in your history.",
  deleteGoalHint:
    "Permanently delete a goal that has no contribution history. Goals with contributions retain their records.",
  editDebt: "Edit debt or receivable",
  debtUpdated: "Debt or receivable updated.",
  debtDeleted: "Debt or receivable deleted.",
  editDebtHint:
    "Set an amount at least equal to recorded payments. The debt or receivable type stays fixed after the first payment, and payment history is preserved.",
  deleteDebtHint:
    "Permanently delete a debt or receivable that has no payment history. Records with payments retain their history.",
  editSchedule: "Edit recurring schedule",
  scheduleUpdated: "Schedule updated.",
  editScheduleHint:
    "Update future forecasts and scheduled entries. Existing transactions stay in your history. Choose Record now when a payment happens.",
  endDate: "End date",
  history: "History",
  contributionHistory: "Contribution history",
  paymentHistory: "Payment history",
  historyReadOnlyHint:
    "This history shows the contributions or payments that make up the recorded total.",
  noHistory: "No history yet",
  noHistoryHint: "Recorded contributions or payments will appear here.",
  accountUnavailable: "Account unavailable",
  historyProtected:
    "This record has linked contributions, payments, or trades. Update the available details while keeping its financial history intact.",
  amountBelowRecorded:
    "Set the total at least equal to the amount already saved or paid, then try again.",
  accountInUse:
    "This account has linked financial records. Review and manage those records before deleting the account.",
  watchAlreadyExists:
    "This ticker is already on your watchlist. Edit the existing entry instead.",
  budgetAlreadyExists:
    "A budget already exists for this category and month. Edit that budget or choose a different category.",
  goalTargetExceeded:
    "This contribution exceeds the remaining goal target. Reduce the amount or increase the target first.",
  debtPaymentExceeded:
    "This payment exceeds the remaining debt or receivable. Reduce the payment amount.",
  editTrade: "Edit stock trade",
  tradeUpdated: "Stock trade updated.",
  tradeEditHint:
    "Saving recalculates brokerage cash, holdings, and gains. Check that each trade has sufficient cash and shares on its date.",
  previousCashImpact: "Previous cash impact",
  manageTrades: "Manage trades",
  manageTradesHint:
    "Holdings are calculated from trades. Edit or delete individual records in Trade history.",
  editWatch: "Edit watchlist entry",
  watchUpdated: "Watchlist entry updated.",
  watchEditHint:
    "Edit the company name and your note. The ticker stays fixed; the company name is shared with your portfolio.",
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
    "Connection failed. Check your connection and try again.",
  serviceUnavailable:
    "Loading your records failed. Try again in a moment.",
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
  irreversible: "Deletion is permanent. Review the record before deleting it.",
  deleteScheduleHint:
    "Deleting a schedule stops future entries. Transactions already recorded will stay in your history.",
  transactionDeleteHint:
    "Permanently delete the transaction and recalculate balances, budgets, and reports.",
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
    "A contribution reserves cash for a goal in its source account. The account balance stays the same.",
  helpPlanning: "Use forecasts carefully",
  helpPlanningBody:
    "Forecasts use your balance and active recurring schedules. Choose Record now once a payment happens to add it to transaction history.",
  helpReconcile: "Check your balance",
  helpReconcileBody:
    "Compare an account with your real statement. Reconciliation records the difference and preserves the recorded balance.",
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
    "Projected balance based on current cash and active recurring schedules.",
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
    "Save the comparison and balance difference. Your recorded balance stays the same.",
} as const

const id: Record<keyof typeof en, string> = {
  cashAfterEdit: "Kas tersedia setelah disimpan di {account}",
  scheduleUnavailable:
    "Jadwal ini belum mulai atau sudah selesai. Periksa tanggal mulai/selesai sebelum mencatat pembayaran.",
  scheduleAlreadyRecorded:
    "Pembayaran hari ini sudah dicatat. Periksa catatannya di riwayat transaksi.",
  helpManage: "Perbarui catatan Anda",
  helpManageBody:
    "Gunakan Ubah atau Hapus di setiap catatan. Buka Kelola transaksi saham untuk mengoreksi catatan saham. Riwayat kontribusi dan pembayaran menyimpan nominal yang sudah dicatat. Periksa konfirmasi sebelum menghapus catatan secara permanen.",
  saveChanges: "Simpan perubahan",
  accountUpdated: "Akun diperbarui.",
  accountDeleted: "Akun dihapus.",
  editAccount: "Ubah akun",
  editAccountHint:
    "Saldo awal adalah saldo sebelum transaksi pertama. Mengubahnya menghitung ulang riwayat saldo akun.",
  deleteAccountHint:
    "Hapus akun secara permanen. Periksa catatan keuangan terkait terlebih dahulu. Akun bisa dihapus setelah seluruh kaitan catatan dilepas.",
  editBudget: "Ubah anggaran",
  budgetUpdated: "Anggaran diperbarui.",
  budgetDeleted: "Anggaran dihapus.",
  editBudgetHint:
    "Ubah batas bulanan atau pengaturan rollover. Pengeluaran tercatat tetap tersimpan di riwayat.",
  deleteBudgetHint:
    "Hapus anggaran dan pengaturan rollover ini secara permanen. Transaksi tetap tersimpan; rollover bulan berikutnya dapat berubah.",
  editGoal: "Ubah tujuan",
  goalUpdated: "Tujuan diperbarui.",
  goalDeleted: "Tujuan dihapus.",
  editGoalHint:
    "Ubah detail dan target tujuan. Tetapkan target minimal sebesar dana terkumpul. Kontribusi tetap tersimpan di riwayat.",
  deleteGoalHint:
    "Hapus permanen tujuan yang belum memiliki riwayat kontribusi. Tujuan dengan kontribusi tetap menyimpan catatannya.",
  editDebt: "Ubah utang atau piutang",
  debtUpdated: "Utang atau piutang diperbarui.",
  debtDeleted: "Utang atau piutang dihapus.",
  editDebtHint:
    "Tetapkan nominal minimal sebesar pembayaran tercatat. Jenis utang atau piutang tetap setelah pembayaran pertama, dan riwayat cicilan tetap tersimpan.",
  deleteDebtHint:
    "Hapus permanen utang atau piutang yang belum memiliki riwayat pembayaran. Catatan dengan pembayaran tetap menyimpan riwayatnya.",
  editSchedule: "Ubah jadwal rutin",
  scheduleUpdated: "Jadwal diperbarui.",
  editScheduleHint:
    "Perbarui proyeksi dan pencatatan terjadwal berikutnya. Transaksi sebelumnya tetap ada di riwayat. Pilih Catat sekarang saat pembayaran terjadi.",
  endDate: "Tanggal selesai",
  history: "Riwayat",
  contributionHistory: "Riwayat kontribusi",
  paymentHistory: "Riwayat cicilan",
  historyReadOnlyHint:
    "Riwayat ini menampilkan kontribusi atau pembayaran yang membentuk total tercatat.",
  noHistory: "Belum ada riwayat",
  noHistoryHint: "Kontribusi atau pembayaran yang dicatat akan muncul di sini.",
  accountUnavailable: "Akun tidak tersedia",
  historyProtected:
    "Catatan ini terhubung ke kontribusi, pembayaran, atau transaksi saham. Perbarui detail yang tersedia sambil menjaga riwayat keuangannya.",
  amountBelowRecorded:
    "Tetapkan total minimal sebesar dana terkumpul atau terbayar, lalu coba lagi.",
  accountInUse:
    "Akun ini memiliki catatan keuangan terkait. Periksa dan kelola catatan tersebut sebelum menghapus akun.",
  watchAlreadyExists:
    "Kode saham ini sudah ada di watchlist. Edit entri yang sudah ada.",
  budgetAlreadyExists:
    "Anggaran kategori dan bulan ini sudah ada. Edit anggaran tersebut atau pilih kategori lain.",
  goalTargetExceeded:
    "Kontribusi melebihi sisa target tujuan. Kurangi jumlah atau naikkan target terlebih dahulu.",
  debtPaymentExceeded:
    "Pembayaran melebihi sisa utang atau piutang. Kurangi jumlah pembayaran.",
  editTrade: "Ubah transaksi saham",
  tradeUpdated: "Transaksi saham diperbarui.",
  tradeEditHint:
    "Menyimpan menghitung ulang kas sekuritas, kepemilikan, dan hasil investasi. Pastikan setiap transaksi memiliki kas dan saham yang cukup pada tanggalnya.",
  previousCashImpact: "Dampak kas sebelumnya",
  manageTrades: "Kelola transaksi saham",
  manageTradesHint:
    "Kepemilikan dihitung dari transaksi saham. Ubah atau hapus setiap catatan di Riwayat transaksi saham.",
  editWatch: "Ubah entri watchlist",
  watchUpdated: "Entri watchlist diperbarui.",
  watchEditHint:
    "Ubah nama perusahaan dan catatan. Kode saham tetap; nama perusahaan juga digunakan di portofolio.",
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
    "Koneksi terputus. Periksa koneksi lalu coba lagi.",
  serviceUnavailable:
    "Pemuatan catatan gagal. Coba lagi sebentar.",
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
    "Penghapusan bersifat permanen. Periksa catatan sebelum menghapusnya.",
  deleteScheduleHint:
    "Menghapus jadwal menghentikan pencatatan berikutnya. Transaksi yang sudah dicatat tetap ada di riwayat.",
  transactionDeleteHint:
    "Hapus transaksi secara permanen dan hitung ulang saldo, anggaran, serta laporan.",
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
    "Kontribusi mencadangkan kas untuk tujuan di akun sumber. Saldo akun tetap sama.",
  helpPlanning: "Gunakan estimasi saldo",
  helpPlanningBody:
    "Proyeksi memakai saldo dan jadwal rutin aktif. Pilih Catat sekarang saat pembayaran terjadi untuk menambahkannya ke riwayat transaksi.",
  helpReconcile: "Periksa saldo",
  helpReconcileBody:
    "Bandingkan akun dengan rekening asli. Rekonsiliasi mencatat selisih dan mempertahankan saldo tercatat.",
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
    "Proyeksi saldo berdasarkan kas saat ini dan jadwal rutin aktif.",
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
    "Simpan perbandingan dan selisih saldo. Saldo tercatat tetap sama.",
}

export const usabilityMessages: Record<Locale, Record<string, string>> = {
  en,
  id,
}
