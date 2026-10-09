import type { Locale } from "./finance"

const en = {
  transactionGroup: "Transaction group",
  transactionGroupSaved: "Transaction group updated.",
  transactionGroupOptional: "Transaction group (optional)",
  transactionGroupHint:
    "Choose a group or create one for a trip, event, or other activity.",
  ungroupedTransactions: "Ungrouped",
  newTransactionGroup: "Create a new group",
  loadingGroups: "Loading groups…",
  groupName: "Group name",
  groupExample: "For example, Japan trip",
  allGroups: "All groups",
  transactionsByGroup: "Transactions by group",
  groupsSummaryHint:
    "Group totals cover all transactions matching your filters. Open a group to review its records.",
  groupTransactionCount: "{count} transactions",
  viewGroupTransactions: "View transactions",
  dailyNavigation: "Everyday money",
  planNavigation: "Plan ahead",
  reviewNavigation: "Review & analyse",
  dismissNotice: "Dismiss notification",
  openWorkspace: "Open dashboard",
  landingOverview: "A place for your everyday money",
  landingOverviewBody:
    "From your first transaction to your next financial goal, keep your records connected.",
  landingTracking: "Know where your money goes",
  landingTrackingBody:
    "Record income, spending, and transfers. Group transactions by activity and filter your history by date or account.",
  landingBudgeting: "Give spending a clear limit",
  landingBudgetingBody:
    "Set monthly budgets and see remaining amounts update as you record expenses.",
  landingGoalsBody:
    "Set a target, add contributions, and see how much is left to save.",
  landingPlanningBody:
    "Bring recurring bills, debts, and planned savings into your next money decision.",
  landingStart: "Start with the money you have",
  landingStartBody: "Build an accurate picture a little at a time.",
  landingStepAccount: "Add your accounts",
  landingStepAccountBody:
    "Enter your bank, cash, or e-wallet balance before your first transaction.",
  landingStepTransaction: "Record money in and out",
  landingStepTransactionBody:
    "Log income and spending. Use a transfer when money moves between your own accounts.",
  landingStepPlan: "Choose your next goal",
  landingStepPlanBody:
    "Review your cash flow, set a spending limit, or start saving for something specific.",
  landingQuestions: "Before you get started",
  landingFaqBank: "Does this connect to my bank?",
  landingFaqBankBody:
    "Enter accounts and transactions manually, then compare the recorded balances with your bank statements.",
  landingFaqBalance: "How are balances calculated?",
  landingFaqBalanceBody:
    "Balances start with your opening amounts and change with recorded transactions. Compare them with your statements to keep your records accurate.",
  landingFaqPlanning: "Do plans create transactions?",
  landingFaqPlanningBody:
    "Forecasts and simulations project future balances. Choose Record now on a recurring schedule to add a completed payment to your history.",
  landingFaqCurrency: "Which currency and languages can I use?",
  landingFaqCurrencyBody:
    "Record amounts in Indonesian rupiah (IDR). Switch between English and Bahasa Indonesia at any time.",
  landingFooterNote: "Your accounts. Your records. Your next step.",
  dashboardDescriptionShort:
    "See your account balances, this month's cash flow, and the next action to take.",
  savingsRateHint: "Share of this month's income left after expenses.",
  savingsRateUnavailable:
    "A savings rate is available once you record income this month.",
  dailyAnalysis: "Daily overview",
  dailyAnalysisDescription:
    "Review today's cash flow and the spending pace for this month.",
  todayIncome: "Income today",
  todayExpense: "Expenses today",
  netToday: "Net today",
  dailyCashFlow: "Daily cash flow",
  dailyCashFlowDescription: "Income and expenses over the last seven days.",
  averageDailyExpense: "Average daily spending",
  averageDailyExpenseHint: "Based on expenses recorded this month to date.",
  highestExpenseDay: "Highest spending day",
  highestExpenseDayHint: "Largest daily expense total this month.",
  topExpenseCategory: "Top spending category",
  topExpenseCategoryHint: "Largest expense category this month.",
  spendingVsLastMonth: "Spending vs last month",
  spendingVsLastMonthHint: "Compared with the same date last month.",
  spendingHigher: "Higher by {amount}",
  spendingLower: "Lower by {amount}",
  spendingSignals: "Key spending signals",
  notAvailable: "Not available",
  exploreReports: "Explore reports",
  accountsCount: "{count} accounts",
  manageAccounts: "Manage accounts",
  accountCreateHint: "Add an account to record income, expenses, or transfers.",
  filterDateError: "Choose an end date on or after the start date.",
  transactionTableHint:
    "On a small screen, swipe across the table to see amounts and actions.",
  calculate: "Calculate",
  calculating: "Calculating...",
  saveGoal: "Save goal",
  saveDebt: "Save debt or receivable",
  saveFund: "Save fund",
  saveWatch: "Save watchlist entry",
  recordAlreadyDone: "Already recorded today",
  scheduleNotStarted: "Starts on {date}",
  scheduleEnded: "Ended on {date}",
  fundNoAllocation: "Allocate money before releasing or spending it.",
  fundNoCash:
    "No cash is available to allocate. Review the source account balance.",
  fundTargetReached: "Your target is fully allocated.",
  fundAccountLocked:
    "The source account stays fixed once this fund has history.",
  budgetAtLimit: "Limit reached",
  goalQuickAmount: "Choose an amount",
  calendarDayHint: "Leave empty to see the whole month.",
  simulationItemLimit:
    "You can compare up to 20 planned items. Remove an item to add another.",
} as const

const id: Record<keyof typeof en, string> = {
  transactionGroup: "Grup transaksi",
  transactionGroupSaved: "Grup transaksi diperbarui.",
  transactionGroupOptional: "Grup transaksi (opsional)",
  transactionGroupHint:
    "Pilih grup atau buat grup untuk perjalanan, acara, atau kegiatan lain.",
  ungroupedTransactions: "Belum dikelompokkan",
  newTransactionGroup: "Buat grup baru",
  loadingGroups: "Memuat grup…",
  groupName: "Nama grup",
  groupExample: "Misalnya, Liburan Jepang",
  allGroups: "Semua grup",
  transactionsByGroup: "Transaksi per grup",
  groupsSummaryHint:
    "Total grup mencakup seluruh transaksi sesuai filter. Buka grup untuk meninjau rinciannya.",
  groupTransactionCount: "{count} transaksi",
  viewGroupTransactions: "Lihat transaksi",
  dailyNavigation: "Keuangan harian",
  planNavigation: "Rencana ke depan",
  reviewNavigation: "Tinjau & analisis",
  dismissNotice: "Tutup pemberitahuan",
  openWorkspace: "Buka dashboard",
  landingOverview: "Ruang untuk keuangan sehari-hari",
  landingOverviewBody:
    "Dari transaksi pertama hingga tujuan berikutnya, kelola catatan keuangan yang saling terhubung.",
  landingTracking: "Ketahui ke mana uang pergi",
  landingTrackingBody:
    "Catat pemasukan, pengeluaran, dan transfer. Kelompokkan transaksi per kegiatan dan telusuri riwayat berdasarkan tanggal atau akun.",
  landingBudgeting: "Beri batas yang jelas untuk belanja",
  landingBudgetingBody:
    "Tetapkan anggaran bulanan dan pantau sisanya setiap kali pengeluaran dicatat.",
  landingGoalsBody:
    "Tentukan target, catat kontribusi, dan lihat berapa lagi yang perlu dikumpulkan.",
  landingPlanningBody:
    "Pertimbangkan tagihan rutin, utang, dan dana terencana saat menentukan langkah keuangan berikutnya.",
  landingStart: "Mulai dari uang yang Anda miliki",
  landingStartBody: "Mulai perlahan, bangun catatan keuangan yang akurat.",
  landingStepAccount: "Tambahkan akun Anda",
  landingStepAccountBody:
    "Masukkan saldo bank, tunai, atau dompet digital sebelum transaksi pertama.",
  landingStepTransaction: "Catat uang masuk dan keluar",
  landingStepTransactionBody:
    "Catat pemasukan dan belanja. Gunakan transfer untuk perpindahan antar akun milik Anda.",
  landingStepPlan: "Tentukan tujuan berikutnya",
  landingStepPlanBody:
    "Tinjau arus kas, tetapkan batas belanja, atau mulai menabung untuk kebutuhan tertentu.",
  landingQuestions: "Sebelum Anda mulai",
  landingFaqBank: "Apakah aplikasi terhubung ke bank saya?",
  landingFaqBankBody:
    "Masukkan akun dan transaksi secara manual, lalu cocokkan saldo tercatat dengan rekening bank Anda.",
  landingFaqBalance: "Bagaimana saldo dihitung?",
  landingFaqBalanceBody:
    "Saldo dimulai dari nominal awal dan berubah mengikuti transaksi tercatat. Bandingkan dengan rekening Anda agar catatan tetap akurat.",
  landingFaqPlanning: "Apakah rencana membuat transaksi?",
  landingFaqPlanningBody:
    "Proyeksi dan simulasi memperkirakan saldo mendatang. Pilih Catat sekarang pada jadwal rutin untuk menambahkan pembayaran yang sudah terjadi ke riwayat.",
  landingFaqCurrency: "Mata uang dan bahasa apa yang tersedia?",
  landingFaqCurrencyBody:
    "Catat nominal dalam rupiah (IDR). Anda bisa beralih antara Bahasa Indonesia dan Inggris kapan saja.",
  landingFooterNote: "Akun Anda. Catatan Anda. Langkah berikutnya.",
  dashboardDescriptionShort:
    "Lihat saldo akun, arus kas bulan ini, dan tindakan berikutnya dalam satu tempat.",
  savingsRateHint:
    "Porsi pemasukan bulan ini yang tersisa setelah pengeluaran.",
  savingsRateUnavailable:
    "Rasio tabungan tersedia setelah Anda mencatat pemasukan bulan ini.",
  dailyAnalysis: "Ringkasan harian",
  dailyAnalysisDescription:
    "Tinjau arus kas hari ini dan laju pengeluaran bulan ini.",
  todayIncome: "Pemasukan hari ini",
  todayExpense: "Pengeluaran hari ini",
  netToday: "Selisih hari ini",
  dailyCashFlow: "Arus kas harian",
  dailyCashFlowDescription:
    "Pemasukan dan pengeluaran dalam tujuh hari terakhir.",
  averageDailyExpense: "Rata-rata belanja harian",
  averageDailyExpenseHint:
    "Berdasarkan pengeluaran yang tercatat sampai hari ini.",
  highestExpenseDay: "Hari pengeluaran tertinggi",
  highestExpenseDayHint: "Total pengeluaran harian terbesar bulan ini.",
  topExpenseCategory: "Kategori pengeluaran utama",
  topExpenseCategoryHint: "Kategori pengeluaran terbesar bulan ini.",
  spendingVsLastMonth: "Belanja vs bulan lalu",
  spendingVsLastMonthHint: "Dibanding tanggal yang sama bulan lalu.",
  spendingHigher: "Lebih tinggi {amount}",
  spendingLower: "Lebih rendah {amount}",
  spendingSignals: "Sinyal pengeluaran utama",
  notAvailable: "Belum tersedia",
  exploreReports: "Lihat laporan",
  accountsCount: "{count} akun",
  manageAccounts: "Kelola akun",
  accountCreateHint:
    "Tambahkan akun untuk mencatat pemasukan, pengeluaran, atau transfer.",
  filterDateError: "Pilih tanggal akhir yang sama atau setelah tanggal awal.",
  transactionTableHint:
    "Di layar kecil, geser tabel untuk melihat nominal dan tindakan.",
  calculate: "Hitung",
  calculating: "Menghitung...",
  saveGoal: "Simpan tujuan",
  saveDebt: "Simpan utang atau piutang",
  saveFund: "Simpan dana",
  saveWatch: "Simpan daftar pantau",
  recordAlreadyDone: "Sudah dicatat hari ini",
  scheduleNotStarted: "Mulai pada {date}",
  scheduleEnded: "Berakhir pada {date}",
  fundNoAllocation: "Alokasikan dana sebelum melepas atau membelanjakannya.",
  fundNoCash:
    "Belum ada kas yang bisa dialokasikan. Periksa saldo akun sumber.",
  fundTargetReached: "Target dana sudah teralokasi penuh.",
  fundAccountLocked:
    "Akun sumber tetap setelah dana memiliki riwayat.",
  budgetAtLimit: "Batas tercapai",
  goalQuickAmount: "Pilih nominal",
  calendarDayHint: "Kosongkan untuk melihat seluruh bulan.",
  simulationItemLimit:
    "Anda bisa membandingkan hingga 20 rencana. Hapus satu rencana untuk menambahkan yang lain.",
}

export const interfaceMessages: Record<Locale, Record<string, string>> = {
  en,
  id,
}
