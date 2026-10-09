"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

import {
  formatCurrency,
  formatDate,
  formatMonth,
  type Locale,
} from "@/lib/finance"
import { usabilityMessages } from "@/lib/usability-messages"
import { planningMessages } from "@/lib/planning-messages"
import { authMessages } from "@/lib/auth-messages"
import { interfaceMessages } from "@/lib/interface-messages"
import { aiMessages } from "@/lib/ai/messages"

type Dictionary = Record<string, string>

const dictionaries: Record<Locale, Dictionary> = {
  en: {
    dashboard: "Dashboard",
    transactions: "Transactions",
    budget: "Budget",
    goals: "Financial goals",
    reports: "Reports",
    planning: "Planning",
    debts: "Debts & receivables",
    accounts: "My accounts",
    language: "Language",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    currentFinancialPosition: "Your financial position",
    moneyAtAGlance: "Your money, at a glance.",
    dashboardDescription:
      "Balances are calculated from each account's opening balance and every recorded transaction.",
    totalBalance: "Total balance",
    monthlyIncome: "Income this month",
    monthlyExpense: "Expenses this month",
    monthlySavingRate: "Savings rate this month",
    cashFlow: "Six-month cash flow",
    cashFlowDescription: "Compare income and expenses by month.",
    balanceProgress: "Balance over time",
    balanceProgressDescription:
      "Cumulative balance from opening balances and all cash flow.",
    loadingSummary: "Loading your financial summary...",
    dataUnavailable: "Loading failed. Refresh the page to try again.",
    summaryUnavailable:
      "Loading your financial summary failed. Refresh the page to try again.",
    accountBalance: "Balance by account",
    accountBalanceDescription:
      "Calculated from opening balances and transactions",
    reconcileBalance: "Reconcile balance",
    recordedBalance: "Recorded balance",
    actualBalance: "Actual account balance",
    compareBalances: "Compare balances",
    actualBalanceInvalid: "Enter the actual account balance as a whole amount in IDR.",
    balancesMatch: "The balance matches your records.",
    balanceDifference: "Difference of {amount} from your records.",
    addAccount: "Add account",
    accountName: "Account name, e.g. BCA",
    chooseAccountType: "Choose account type",
    openingBalance: "Opening balance (optional)",
    noteOptional: "Note (optional)",
    saveAccount: "Save account",
    saving: "Saving...",
    accountSaveFailed: "Saving the account failed. Check the fields and try again.",
    income: "Income",
    expense: "Expense",
    transfer: "Transfer",
    amount: "Amount",
    share: "Share",
    category: "Category",
    chooseCategory: "Choose a category",
    chooseAccount: "Choose an account",
    sourceAccount: "Source account",
    destinationAccount: "Destination account",
    transactionType: "Transaction type",
    note: "Note (optional)",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    addTransaction: "Add transaction",
    recordTransaction: "Record transaction",
    editTransaction: "Edit transaction",
    saveTransaction: "Save transaction",
    transactionSaveFailed: "Saving the transaction failed. Check the fields and try again.",
    transactionTitle: "Transactions",
    transactionDescription: "Record cash flow and group transactions for trips, events, or other activities.",
    addAnAccountFirst: "Add an account before recording a transaction.",
    filteredIncome: "Filtered income",
    filteredExpense: "Filtered expenses",
    filteredDifference: "Filtered difference",
    transactionHistory: "Transaction history",
    searchTransactions: "Search category, group, or note",
    allTypes: "All types",
    allAccounts: "All accounts",
    fromDate: "From date",
    toDate: "To date",
    date: "Date",
    type: "Type",
    account: "Account",
    actions: "Actions",
    noMatchingTransactions: "No transactions match these filters.",
    page: "Page {current} of {total}",
    previous: "Previous",
    next: "Next",
    deleteTransactionConfirm:
      "Delete this transaction? Balances and reports will be recalculated.",
    transactionDeleteFailed: "Deleting the transaction failed. Refresh the list and try again.",
    budgetTitle: "Budget",
    budgetDescription:
      "Spending limits that automatically follow your transactions.",
    selectBudgetMonth: "Select budget month",
    addBudget: "Add budget",
    budgetLimit: "Budget limit",
    rollover: "Carry remaining budget into the next month",
    saveBudget: "Save budget",
    budgetLoadFailed: "Loading the budget failed. Try again.",
    budgetSaveFailed: "Saving the budget failed. Check the fields and try again.",
    totalBudget: "Total budget",
    spent: "Spent",
    remaining: "Remaining",
    noBudget: "No budget for {month}",
    addBudgetHint: "Add a spending limit to start tracking expenses.",
    overLimit: "Over limit",
    nearlyUsed: "Nearly used",
    onTrack: "On track",
    includesRollover: "Includes rollover {amount}",
    of: "of",
    overBy: "Over by {amount}",
    remainingAmount: "Remaining {amount}",
    goalsTitle: "Financial goals",
    goalsDescription: "Set and track the progress of your financial goals.",
    addGoal: "Add goal",
    goalName: "Goal name",
    goalExample: "Example: Emergency fund",
    goalDescription: "Goal description",
    targetAmount: "Target amount",
    targetDate: "Target date",
    chooseContributionAccount: "Choose a contribution account",
    contributionHint:
      "Reserve cash for this goal in the selected account. Its balance stays the same.",
    totalGoals: "Total goals",
    completedGoals: "Completed goals",
    totalTarget: "Total target",
    totalSaved: "Total saved",
    completed: "Completed",
    overdue: "Overdue",
    urgent: "Urgent",
    active: "Active",
    contribution: "Contribution",
    contribute: "Contribute",
    contributionFailed: "Saving the contribution failed. Check the amount and try again.",
    goalSaveFailed: "Saving the goal failed. Check the fields and try again.",
    debtsTitle: "Debts & receivables",
    debtsDescription: "Record partial payments and their repayment history.",
    addDebt: "Add debt/receivable",
    debt: "Debt (I owe someone)",
    receivable: "Receivable (someone owes me)",
    counterparty: "Lender or borrower name",
    addDebtFailed: "Saving the debt or receivable failed. Check the fields and try again.",
    debtTo: "Debt to",
    receivableFrom: "Receivable from",
    paid: "Paid",
    unpaid: "Active",
    total: "Total",
    paidAmount: "Paid amount",
    recordPayment: "Record payment",
    paymentAmount: "Payment amount",
    paymentAccount: "Account used",
    savePayment: "Save payment",
    paymentSaveFailed: "Saving the payment failed. Check the amount and account, then try again.",
    noDebts: "No debts or receivables yet.",
    planningTitle: "Financial planning",
    planningDescription:
      "Estimate your balance until payday and manage recurring transactions.",
    forecastTitle: "Forecast until payday",
    forecastDescription:
      "The projection uses the current balance and active recurring schedules.",
    calculateForecast: "Calculate forecast",
    estimatedBalance: "Estimated balance on {date}",
    currentBalance: "Current balance {amount}",
    schedulesIncluded: "{count} schedules included",
    addRecurring: "Add recurring schedule",
    recurringDescription:
      "Use this for salary, bills, subscriptions, or installments.",
    scheduleName: "Name, e.g. Internet",
    frequency: "Frequency",
    monthly: "Monthly",
    weekly: "Weekly",
    saveSchedule: "Save schedule",
    activeSchedules: "Active schedules",
    noSchedules: "No recurring schedules yet.",
    starts: "starts",
    recordNow: "Record now",
    deleteScheduleConfirm: "Delete this recurring schedule?",
    scheduleSaveFailed: "Saving the schedule failed. Check the fields and try again.",
    forecastFailed: "Calculating the projection failed. Try again.",
    scheduleRecordFailed: "Recording the scheduled payment failed. Review transaction history before trying again.",
    reportsTitle: "Reports",
    reportsDescription:
      "Income and expense distribution for your selected period.",
    selectReportPeriod: "Select report period",
    expensesByCategory: "Expenses by category",
    expensesByCategoryDescription: "Where your money goes.",
    incomeSources: "Income sources",
    incomeSourcesDescription: "Where your money comes from.",
    noExpenseData: "No expenses in this period.",
    noIncomeData: "No income in this period.",
    changeInsights: "Change insights",
    previousMonthComparison: "Compared with the previous month.",
    expenseBreakdown: "Expense breakdown",
    noData: "No data to display.",
  },
  id: {
    dashboard: "Dashboard",
    transactions: "Transaksi",
    budget: "Anggaran",
    goals: "Tujuan keuangan",
    reports: "Laporan",
    planning: "Rencana",
    debts: "Utang & piutang",
    accounts: "Akun saya",
    language: "Bahasa",
    openMenu: "Buka menu",
    closeMenu: "Tutup menu",
    currentFinancialPosition: "Kondisi keuangan saat ini",
    moneyAtAGlance: "Uang Anda, dalam satu pandangan.",
    dashboardDescription:
      "Saldo dihitung dari saldo awal setiap akun dan seluruh transaksi yang tercatat.",
    totalBalance: "Saldo seluruh akun",
    monthlyIncome: "Pemasukan bulan ini",
    monthlyExpense: "Pengeluaran bulan ini",
    monthlySavingRate: "Rasio tabungan bulan ini",
    cashFlow: "Arus kas enam bulan",
    cashFlowDescription: "Bandingkan pemasukan dengan pengeluaran per bulan.",
    balanceProgress: "Perkembangan saldo",
    balanceProgressDescription:
      "Saldo kumulatif dari saldo awal dan seluruh arus kas.",
    loadingSummary: "Memuat ringkasan keuangan...",
    dataUnavailable: "Pemuatan data gagal. Muat ulang halaman untuk mencoba lagi.",
    summaryUnavailable:
      "Pemuatan ringkasan keuangan gagal. Muat ulang halaman untuk mencoba lagi.",
    accountBalance: "Saldo per akun",
    accountBalanceDescription: "Dihitung dari saldo awal dan transaksi",
    reconcileBalance: "Rekonsiliasi saldo",
    recordedBalance: "Saldo menurut catatan",
    actualBalance: "Saldo aktual di rekening",
    compareBalances: "Bandingkan saldo",
    actualBalanceInvalid: "Masukkan saldo akun sebenarnya sebagai nominal bulat dalam IDR.",
    balancesMatch: "Saldo cocok dengan catatan.",
    balanceDifference: "Selisih {amount} dari catatan.",
    addAccount: "Tambah akun",
    accountName: "Nama akun, misalnya BCA",
    chooseAccountType: "Pilih tipe akun",
    openingBalance: "Saldo awal (opsional)",
    noteOptional: "Catatan (opsional)",
    saveAccount: "Simpan akun",
    saving: "Menyimpan...",
    accountSaveFailed: "Penyimpanan akun gagal. Periksa isian lalu coba lagi.",
    income: "Pemasukan",
    expense: "Pengeluaran",
    transfer: "Transfer",
    amount: "Jumlah",
    share: "Porsi",
    category: "Kategori",
    chooseCategory: "Pilih kategori",
    chooseAccount: "Pilih akun",
    sourceAccount: "Akun asal",
    destinationAccount: "Akun tujuan",
    transactionType: "Jenis transaksi",
    note: "Catatan (opsional)",
    save: "Simpan",
    cancel: "Batal",
    edit: "Ubah",
    delete: "Hapus",
    addTransaction: "Tambah transaksi",
    recordTransaction: "Catat transaksi",
    editTransaction: "Ubah transaksi",
    saveTransaction: "Simpan transaksi",
    transactionSaveFailed: "Penyimpanan transaksi gagal. Periksa isian lalu coba lagi.",
    transactionTitle: "Transaksi",
    transactionDescription: "Catat arus uang dan kelompokkan transaksi untuk perjalanan, acara, atau kegiatan lainnya.",
    addAnAccountFirst:
      "Tambahkan akun terlebih dahulu sebelum mencatat transaksi.",
    filteredIncome: "Pemasukan terfilter",
    filteredExpense: "Pengeluaran terfilter",
    filteredDifference: "Selisih terfilter",
    transactionHistory: "Riwayat transaksi",
    searchTransactions: "Cari kategori, grup, atau catatan",
    allTypes: "Semua jenis",
    allAccounts: "Semua akun",
    fromDate: "Dari tanggal",
    toDate: "Sampai tanggal",
    date: "Tanggal",
    type: "Jenis",
    account: "Akun",
    actions: "Aksi",
    noMatchingTransactions: "Tidak ada transaksi yang sesuai dengan filter.",
    page: "Halaman {current} dari {total}",
    previous: "Sebelumnya",
    next: "Berikutnya",
    deleteTransactionConfirm:
      "Hapus transaksi ini? Saldo dan laporan akan dihitung ulang.",
    transactionDeleteFailed: "Penghapusan transaksi gagal. Perbarui daftar lalu coba lagi.",
    budgetTitle: "Anggaran",
    budgetDescription: "Batas belanja yang otomatis mengikuti transaksi Anda.",
    selectBudgetMonth: "Pilih bulan anggaran",
    addBudget: "Tambah anggaran",
    budgetLimit: "Batas anggaran",
    rollover: "Bawa sisa anggaran ke bulan berikutnya",
    saveBudget: "Simpan anggaran",
    budgetLoadFailed: "Pemuatan anggaran gagal. Coba lagi.",
    budgetSaveFailed: "Penyimpanan anggaran gagal. Periksa isian lalu coba lagi.",
    totalBudget: "Total anggaran",
    spent: "Terpakai",
    remaining: "Sisa",
    noBudget: "Belum ada anggaran untuk {month}",
    addBudgetHint: "Tambahkan batas belanja untuk mulai memantau pengeluaran.",
    overLimit: "Melebihi batas",
    nearlyUsed: "Hampir habis",
    onTrack: "Terkendali",
    includesRollover: "Termasuk rollover {amount}",
    of: "dari",
    overBy: "Melebihi {amount}",
    remainingAmount: "Sisa {amount}",
    goalsTitle: "Tujuan keuangan",
    goalsDescription: "Tetapkan dan lacak pencapaian tujuan keuangan Anda.",
    addGoal: "Tambah tujuan",
    goalName: "Nama tujuan",
    goalExample: "Contoh: Dana darurat",
    goalDescription: "Deskripsi tujuan",
    targetAmount: "Target jumlah",
    targetDate: "Target tanggal",
    chooseContributionAccount: "Pilih akun sumber kontribusi",
    contributionHint:
      "Cadangkan kas untuk tujuan ini di akun pilihan. Saldo akun tetap sama.",
    totalGoals: "Total tujuan",
    completedGoals: "Tujuan tercapai",
    totalTarget: "Total target",
    totalSaved: "Total terkumpul",
    completed: "Tercapai",
    overdue: "Terlambat",
    urgent: "Mendesak",
    active: "Berjalan",
    contribution: "Kontribusi",
    contribute: "Kontribusi",
    contributionFailed: "Penyimpanan kontribusi gagal. Periksa nominal lalu coba lagi.",
    goalSaveFailed: "Penyimpanan tujuan gagal. Periksa isian lalu coba lagi.",
    debtsTitle: "Utang & piutang",
    debtsDescription: "Catat pembayaran bertahap dan riwayat pelunasannya.",
    addDebt: "Tambah utang/piutang",
    debt: "Utang (saya berutang)",
    receivable: "Piutang (orang berutang ke saya)",
    counterparty: "Nama pemberi/penerima",
    addDebtFailed: "Penyimpanan utang atau piutang gagal. Periksa isian lalu coba lagi.",
    debtTo: "Utang ke",
    receivableFrom: "Piutang dari",
    paid: "Lunas",
    unpaid: "Berjalan",
    total: "Total",
    paidAmount: "Sudah dibayar",
    recordPayment: "Catat pembayaran",
    paymentAmount: "Jumlah pembayaran",
    paymentAccount: "Akun yang digunakan",
    savePayment: "Simpan pembayaran",
    paymentSaveFailed: "Penyimpanan pembayaran gagal. Periksa nominal dan akun, lalu coba lagi.",
    noDebts: "Belum ada data utang atau piutang.",
    planningTitle: "Rencana keuangan",
    planningDescription:
      "Lihat estimasi saldo menuju gajian dan kelola transaksi yang berulang.",
    forecastTitle: "Forecast sampai gajian",
    forecastDescription:
      "Proyeksi memakai saldo saat ini dan jadwal rutin aktif.",
    calculateForecast: "Hitung forecast",
    estimatedBalance: "Estimasi saldo pada {date}",
    currentBalance: "Saldo saat ini {amount}",
    schedulesIncluded: "{count} jadwal diperhitungkan",
    addRecurring: "Tambah jadwal rutin",
    recurringDescription:
      "Gunakan untuk gaji, tagihan, langganan, atau cicilan.",
    scheduleName: "Nama, misalnya Internet",
    frequency: "Frekuensi",
    monthly: "Bulanan",
    weekly: "Mingguan",
    saveSchedule: "Simpan jadwal",
    activeSchedules: "Jadwal aktif",
    noSchedules: "Belum ada jadwal rutin.",
    starts: "mulai",
    recordNow: "Catat sekarang",
    deleteScheduleConfirm: "Hapus jadwal rutin ini?",
    scheduleSaveFailed: "Penyimpanan jadwal gagal. Periksa isian lalu coba lagi.",
    forecastFailed: "Perhitungan proyeksi gagal. Coba lagi.",
    scheduleRecordFailed: "Pencatatan pembayaran terjadwal gagal. Periksa riwayat transaksi sebelum mencoba lagi.",
    reportsTitle: "Laporan",
    reportsDescription:
      "Distribusi pemasukan dan pengeluaran untuk periode pilihan Anda.",
    selectReportPeriod: "Pilih periode laporan",
    expensesByCategory: "Pengeluaran per kategori",
    expensesByCategoryDescription: "Ke mana uang Anda digunakan.",
    incomeSources: "Sumber pemasukan",
    incomeSourcesDescription: "Dari mana uang Anda datang.",
    noExpenseData: "Belum ada pengeluaran dalam periode ini.",
    noIncomeData: "Belum ada pemasukan dalam periode ini.",
    changeInsights: "Insight perubahan",
    previousMonthComparison: "Perbandingan dengan bulan sebelumnya.",
    expenseBreakdown: "Rincian pengeluaran",
    noData: "Belum ada data untuk ditampilkan.",
  },
}

type LanguageContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, values?: Record<string, string | number>) => string
  formatCurrency: (amount: number) => string
  formatDate: (date: string) => string
  formatMonth: (month: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, updateLocale] = useState<Locale>("en")

  function setLocale(value: Locale) {
    window.localStorage.setItem("locale", value)
    updateLocale(value)
  }

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("locale")
    if (savedLocale !== "en" && savedLocale !== "id") return
    const timer = window.setTimeout(() => updateLocale(savedLocale))
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: string, values: Record<string, string | number> = {}) =>
        Object.entries(values).reduce(
          (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
          aiMessages[locale][key] ??
            interfaceMessages[locale][key] ??
            authMessages[locale][key] ??
            planningMessages[locale][key] ??
            usabilityMessages[locale][key] ??
            dictionaries[locale][key] ??
            key,
        ),
      formatCurrency: (amount: number) => formatCurrency(amount, locale),
      formatDate: (date: string) => formatDate(date, locale),
      formatMonth: (month: string) => formatMonth(month, locale),
    }),
    [locale],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context)
    throw new Error("useLanguage must be used within LanguageProvider")
  return context
}
