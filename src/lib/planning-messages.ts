import type { Locale } from "./finance"

const en = {
  helpInvestments: "Separate brokerage cash from stocks",
  helpInvestmentsBody:
    "Record purchases and sales in Investments, including fees. Opening balances represent cash only. Daily prices require a configured provider; price dates and incomplete valuations stay visible.",
  helpNetWorth: "Avoid counting assets twice",
  helpNetWorthBody:
    "Net worth adds cash, valued stocks, and receivables, then subtracts unpaid debts. Money allocated to goals or sinking funds is already included in cash.",
  helpSimulation: "Calculate planned spending safely",
  helpSimulationBody:
    "See your current cash and scheduled cash flow, then add several planned incomes and expenses to estimate your cash. The calculator never creates real transactions or schedules.",
  helpCalendar: "See upcoming financial dates",
  helpCalendarBody:
    "Browse recurring schedules, debt deadlines, and fund targets by month. These are planned dates, not proof of payment; reminders can overlap with recurring schedules.",
  helpFunds: "Reserve money for predictable expenses",
  helpFundsBody:
    "Allocate existing cash to a fund without moving money. Release makes it available again. Spend creates one real expense; do not record that same payment again in Transactions.",
  investments: "Investments",
  netWorth: "Net worth",
  calendar: "Financial calendar",
  simulation: "Expense calculator",
  funds: "Sinking funds",
  investmentsDescription:
    "Track IDX stocks, cash in your brokerage accounts, and investment gains in IDR.",
  netWorthDescription:
    "Cash and stock market value, plus receivables, minus outstanding debts.",
  calendarDescription:
    "Recurring payments, income, debt deadlines, and planned fund targets in one place.",
  simulationDescription:
    "Combine your current cash and scheduled calendar cash flow with planned incomes and expenses. Nothing is saved to your real transactions.",
  fundsDescription:
    "Set money aside for predictable expenses such as annual insurance, vehicle tax, or a holiday.",
  totalBalance: "Cash across accounts",
  accountBalance: "Cash by account",
  accountBalanceDescription:
    "Opening cash and recorded cash flows. Stock holdings are valued separately.",
  balanceProgressDescription:
    "Cash balance after transactions and stock purchases or sales; this is not investment performance.",
  investmentOpeningHint:
    "Enter available cash in this brokerage account, not the value of stocks you own. Record stock purchases separately.",
  portfolio: "Portfolio",
  watchlist: "Watchlist",
  tradeHistory: "Trade history",
  recordTrade: "Record stock trade",
  buy: "Buy",
  sell: "Sell",
  tradeSide: "Buy or sell",
  stockSymbol: "IDX ticker",
  stockName: "Company name",
  stockSymbolHint:
    "Four-letter IDX symbol, for example BBCA. This records a trade; it does not place an order with a broker.",
  brokerageAccount: "Brokerage cash account",
  lots: "Lots",
  lotsHint:
    "1 lot = 100 shares. Decimal lots are allowed (1.25 lots = 125 shares), up to 6 decimal places.",
  stockPriceHint:
    "Prices support up to 4 decimal places. Average cost is calculated from your trades and fees; cash totals are rounded to 2 decimal places.",
  shares: "Shares",
  pricePerShare: "Price per share (IDR)",
  tradingFees: "Total fees and taxes (IDR)",
  tradeTotal: "Cash impact",
  costBasis: "Remaining cost basis",
  averageCost: "Average cost / share",
  marketPrice: "Last daily close",
  marketValue: "Market value",
  unrealizedGain: "Unrealized gain/loss",
  realizedGain: "Realized gain/loss",
  totalInvestmentGain: "Total gain/loss",
  investmentCash: "Brokerage cash",
  availableCash: "Unallocated cash",
  quotedOn: "Price date",
  unpriced: "Not valued yet",
  unpricedHint:
    "{count} holding(s) have no market price. The portfolio total is incomplete; recorded cost is not substituted for market value.",
  refreshPrices: "Update daily prices",
  priceUpdateResult:
    "{updated} updated, {cached} cached, {failed} failed, {pending} pending.",
  tradeSaved: "Stock trade recorded. Cash and holdings updated.",
  tradeDeleted: "Stock trade removed. Cash and holdings recalculated.",
  watchAdded: "Stock added to your watchlist.",
  watchRemoved: "Stock removed from your watchlist.",
  addWatch: "Add to watchlist",
  removeWatch: "Remove from watchlist",
  noHoldings: "Start your stock portfolio",
  noHoldingsHint:
    "Add a brokerage cash account, then record an actual stock purchase. Do not enter holdings as an opening cash balance.",
  noWatchlist: "What stocks are you following?",
  noWatchlistHint:
    "Add IDX symbols to view daily prices without recording a purchase.",
  noTrades: "No stock trades yet.",
  tradeDeleteHint:
    "Permanently delete this trade. Cash, cost basis, and gains will be recalculated. Removal is blocked if it would leave a sale without enough shares or insufficient cash.",
  removeWatchHint:
    "Permanently remove this watchlist entry and note. Your trades and holdings stay unchanged; you can add the ticker again.",
  corporateActionsHint:
    "This version does not automatically apply stock splits or other corporate actions.",
  insufficientShares:
    "This sale exceeds the shares owned on its date. Check the account, quantity, and earlier trades.",
  insufficientCash:
    "This action would leave insufficient cash. Check opening cash and transactions, or record the funding transfer first.",
  insufficientAvailableCash:
    "Not enough unallocated cash. Money already assigned to goals or sinking funds is reserved.",
  fundBalanceExceeded: "The amount exceeds the money allocated to this fund.",
  fundTargetExceeded:
    "The allocation exceeds the target, or the target is below the existing allocation.",
  linkedFundTransaction:
    "This expense belongs to a sinking fund and cannot be changed independently of its fund history.",
  marketDataUnavailable:
    "Yahoo Finance could not be reached or returned unreadable data. Your saved prices were kept. Try again later; this is a market-data error, not a database connection error.",
  priceAccessRequired:
    "Yahoo Finance temporarily rejected access. Saved prices were kept. Wait and retry; this integration does not require an API key.",
  pricesRateLimited:
    "The market-data limit was reached. Existing prices were kept; wait for your provider quota to reset, then retry.",
  invalidMarketPrice:
    "Yahoo Finance returned no valid completed daily IDR close for this IDX ticker. Check its .JK listing and price date; saved prices were kept.",
  knownNetWorth: "Known subtotal",
  cashAssets: "Cash assets",
  stockAssets: "Valued stocks",
  receivableAssets: "Outstanding receivables",
  debtLiabilities: "Outstanding debts",
  reservedCash: "Allocated cash",
  netWorthRule:
    "Allocations to goals and funds are already part of cash, not additional assets.",
  incompleteNetWorth:
    "Net worth is incomplete because some stock holdings have no price.",
  viewNetWorth: "View net worth",
  assetsAndLiabilities: "Assets and liabilities",
  accountBreakdown: "Cash accounts",
  outstandingObligations: "Outstanding debts and receivables",
  noObligations: "No outstanding obligations.",
  noCalendarEvents: "No scheduled events this month",
  calendarHint:
    "Planned dates, not posted transactions. Debt deadlines and fund targets are reminders and may overlap with a recurring payment.",
  agenda: "Agenda",
  recurring: "Recurring schedule",
  debtDue: "Debt due",
  receivableDue: "Receivable due",
  fundDue: "Fund target",
  eventsOn: "Events on {date}",
  noEventsOnDay: "No events on this date.",
  calendarGoTo: "Manage",
  monthPrevious: "Previous month",
  monthNext: "Next month",
  today: "Today",
  simulateUntil: "Project through",
  calculateExpenses: "Calculate projection",
  calculating: "Calculating...",
  simulationHint:
    "The baseline includes active recurring schedules. Unscheduled spending, debt deadlines, and future investment changes are not automatically included.",
  calculatorHint:
    "Active recurring income and expenses from your financial calendar are included from today to the selected date. Debt deadlines and fund targets remain reminders only, so they are excluded to avoid double-counting.",
  currentCashHint:
    "This is your recorded cash across accounts and the starting point for the projection.",
  addedIncome: "Added income",
  additionalIncomeHint:
    "Add one-off income to see its effect before recording it.",
  addIncome: "Add income",
  removeIncome: "Remove income",
  incomeName: "Income name",
  incomeAmount: "Amount (IDR)",
  incomeDate: "Income date",
  addedExpenses: "Added expenses",
  additionalExpenseHint:
    "Add one-off expenses to see their effect before recording them.",
  addExpense: "Add expense",
  removeExpense: "Remove expense",
  expenseName: "Expense name",
  expenseAmount: "Amount (IDR)",
  expenseDate: "Expense date",
  currentCash: "Current cash",
  scheduledIncome: "Scheduled income",
  scheduledExpenses: "Scheduled expenses",
  projectedCash: "Projected cash",
  baseline: "Without extra plans",
  scenario: "With extra plans",
  scenarioDifference: "Change in balance",
  plannedExpenseCount: "{count} planned expense(s) added.",
  plannedIncomeCount: "{count} planned income(s) added.",
  simulationOnly: "Preview only. No transactions or schedules were created.",
  simulationStale:
    "Your input or financial data changed. Run the comparison again.",
  negativeScenario:
    "This scenario would leave a negative cash balance in at least one month.",
  monthlyProjection: "Monthly projection",
  addFund: "Add sinking fund",
  editFund: "Edit sinking fund",
  fundName: "Fund name",
  fundExample: "Example: Annual vehicle tax",
  fundAccount: "Account holding the money",
  fundAllocation: "Allocated",
  suggestedMonthlySaving: "Suggested allocation this month",
  fundHint:
    "Allocating or releasing money does not move cash. Spend records an actual expense in this account.",
  allocate: "Allocate",
  release: "Release allocation",
  spend: "Spend from fund",
  fundHistory: "Fund history",
  allocateMoney: "Allocate money",
  releaseMoney: "Release money",
  spendMoney: "Record fund expense",
  fundSaved: "Sinking fund saved.",
  fundEntrySaved: "Fund history updated.",
  fundDeleted: "Empty sinking fund deleted.",
  noFunds: "Plan for your next predictable expense",
  noFundsHint:
    "Create a fund with a target date and source account, then allocate money as you save.",
  noFundHistory: "No allocations or spending yet.",
  fundDeleteHint:
    "Only funds without history can be deleted. Release unused allocations to keep the history of an existing fund.",
  availableInAccount: "Unallocated in this account: {amount}",
  fundSpendHint:
    "This creates an expense today. Do not record the same payment again in Transactions.",
  fundReleaseHint:
    "This makes allocated money available again without recording income.",
  fundAllocateHint:
    "This reserves existing cash for this purpose without creating an expense.",
}

const id: Record<keyof typeof en, string> = {
  helpInvestments: "Pisahkan kas sekuritas dari saham",
  helpInvestmentsBody:
    "Catat beli dan jual di Investasi, termasuk biayanya. Saldo awal hanya mewakili kas. Harga harian membutuhkan penyedia terkonfigurasi; tanggal harga dan penilaian yang belum lengkap tetap ditampilkan.",
  helpNetWorth: "Hindari menghitung aset dua kali",
  helpNetWorthBody:
    "Kekayaan bersih menjumlahkan kas, saham yang sudah dinilai, dan piutang, lalu mengurangi sisa utang. Alokasi tujuan dan sinking funds sudah termasuk kas.",
  helpSimulation: "Hitung rencana pengeluaran dengan aman",
  helpSimulationBody:
    "Lihat kas saat ini dan arus kas terjadwal, lalu tambahkan beberapa rencana pemasukan dan pengeluaran untuk memperkirakan kas. Kalkulator tidak membuat transaksi atau jadwal asli.",
  helpCalendar: "Lihat tanggal keuangan mendatang",
  helpCalendarBody:
    "Telusuri jadwal rutin, jatuh tempo utang, dan target dana per bulan. Ini tanggal rencana, bukan bukti pembayaran; pengingat bisa beririsan dengan jadwal rutin.",
  helpFunds: "Cadangkan uang untuk kebutuhan terencana",
  helpFundsBody:
    "Alokasikan kas yang sudah ada ke dana tanpa memindahkan uang. Pelepasan membuatnya tersedia lagi. Belanja membuat satu pengeluaran nyata; jangan catat pembayaran yang sama lagi di Transaksi.",
  investments: "Investasi",
  netWorth: "Kekayaan bersih",
  calendar: "Kalender keuangan",
  simulation: "Kalkulator pengeluaran",
  funds: "Sinking funds",
  investmentsDescription:
    "Pantau saham BEI, kas akun sekuritas, dan hasil investasi dalam IDR.",
  netWorthDescription:
    "Kas dan nilai pasar saham, ditambah piutang, dikurangi sisa utang.",
  calendarDescription:
    "Pembayaran rutin, pemasukan, jatuh tempo utang, dan target dana dalam satu tempat.",
  simulationDescription:
    "Gabungkan kas saat ini dan arus kas kalender terjadwal dengan rencana pemasukan dan pengeluaran. Transaksi asli tidak berubah.",
  fundsDescription:
    "Sisihkan uang untuk kebutuhan terencana seperti premi tahunan, pajak kendaraan, atau liburan.",
  totalBalance: "Kas seluruh akun",
  accountBalance: "Kas per akun",
  accountBalanceDescription:
    "Saldo kas awal dan arus kas tercatat. Kepemilikan saham dinilai terpisah.",
  balanceProgressDescription:
    "Saldo kas setelah transaksi dan beli/jual saham; bukan kinerja investasi.",
  investmentOpeningHint:
    "Masukkan kas tersedia di akun sekuritas, bukan nilai saham yang dimiliki. Catat pembelian saham secara terpisah.",
  portfolio: "Portofolio",
  watchlist: "Watchlist",
  tradeHistory: "Riwayat saham",
  recordTrade: "Catat transaksi saham",
  buy: "Beli",
  sell: "Jual",
  tradeSide: "Beli atau jual",
  stockSymbol: "Kode saham BEI",
  stockName: "Nama perusahaan",
  stockSymbolHint:
    "Kode empat huruf BEI, misalnya BBCA. Ini mencatat transaksi, bukan memasang order ke sekuritas.",
  brokerageAccount: "Akun kas sekuritas",
  lots: "Lot",
  lotsHint:
    "1 lot = 100 lembar. Lot desimal diperbolehkan (1,25 lot = 125 lembar), maksimal 6 angka desimal.",
  stockPriceHint:
    "Harga mendukung maksimal 4 angka desimal. Modal rata-rata dihitung dari transaksi dan biaya Anda; total kas dibulatkan ke 2 angka desimal.",
  shares: "Lembar",
  pricePerShare: "Harga per lembar (IDR)",
  tradingFees: "Total biaya dan pajak (IDR)",
  tradeTotal: "Perubahan kas",
  costBasis: "Modal kepemilikan tersisa",
  averageCost: "Modal rata-rata / lembar",
  marketPrice: "Harga penutupan terakhir",
  marketValue: "Nilai pasar",
  unrealizedGain: "Untung/rugi belum direalisasikan",
  realizedGain: "Untung/rugi terealisasi",
  totalInvestmentGain: "Total untung/rugi",
  investmentCash: "Kas sekuritas",
  availableCash: "Kas belum dialokasikan",
  quotedOn: "Tanggal harga",
  unpriced: "Belum dinilai",
  unpricedHint:
    "{count} kepemilikan belum memiliki harga pasar. Total portofolio belum lengkap; modal tidak dipakai sebagai pengganti nilai pasar.",
  refreshPrices: "Perbarui harga harian",
  priceUpdateResult:
    "{updated} diperbarui, {cached} tersimpan, {failed} gagal, {pending} tertunda.",
  tradeSaved: "Transaksi saham dicatat. Kas dan kepemilikan diperbarui.",
  tradeDeleted: "Transaksi saham dihapus. Kas dan kepemilikan dihitung ulang.",
  watchAdded: "Saham ditambahkan ke watchlist.",
  watchRemoved: "Saham dihapus dari watchlist.",
  addWatch: "Tambah ke watchlist",
  removeWatch: "Hapus dari watchlist",
  noHoldings: "Mulai portofolio saham Anda",
  noHoldingsHint:
    "Tambahkan akun kas sekuritas, lalu catat pembelian saham yang benar-benar terjadi. Jangan masukkan kepemilikan sebagai saldo kas awal.",
  noWatchlist: "Saham apa yang Anda pantau?",
  noWatchlistHint:
    "Tambahkan kode BEI untuk melihat harga harian tanpa mencatat pembelian.",
  noTrades: "Belum ada transaksi saham.",
  tradeDeleteHint:
    "Hapus transaksi saham ini secara permanen. Kas, modal, dan hasil dihitung ulang. Penghapusan ditolak bila membuat penjualan kekurangan saham atau kas tidak cukup.",
  removeWatchHint:
    "Hapus entri watchlist dan catatan ini secara permanen. Transaksi dan kepemilikan saham tetap tersimpan; kode saham bisa ditambahkan lagi.",
  corporateActionsHint:
    "Versi ini belum menerapkan stock split atau aksi korporasi lain secara otomatis.",
  insufficientShares:
    "Penjualan melebihi saham yang dimiliki pada tanggalnya. Periksa akun, jumlah, dan transaksi sebelumnya.",
  insufficientCash:
    "Kas tidak cukup untuk tindakan ini. Periksa saldo awal dan transaksi, atau catat transfer pendanaan terlebih dahulu.",
  insufficientAvailableCash:
    "Kas belum dialokasikan tidak cukup. Uang yang sudah dialokasikan untuk tujuan atau sinking funds dicadangkan.",
  fundBalanceExceeded:
    "Nominal melebihi uang yang dialokasikan untuk dana ini.",
  fundTargetExceeded:
    "Alokasi melebihi target, atau target lebih kecil daripada alokasi yang sudah ada.",
  linkedFundTransaction:
    "Pengeluaran ini terkait sinking fund dan tidak dapat diubah terpisah dari riwayat dananya.",
  marketDataUnavailable:
    "Yahoo Finance tidak dapat dihubungi atau mengirim data yang tidak terbaca. Harga tersimpan tetap dipertahankan. Coba lagi nanti; ini kesalahan layanan harga, bukan koneksi database.",
  priceAccessRequired:
    "Yahoo Finance menolak akses sementara. Harga tersimpan tetap dipertahankan. Tunggu lalu coba lagi; integrasi ini tidak memerlukan API key.",
  pricesRateLimited:
    "Batas data pasar tercapai. Harga sebelumnya tetap disimpan; tunggu kuota penyedia pulih, lalu coba lagi.",
  invalidMarketPrice:
    "Yahoo Finance tidak mengirim harga penutupan harian IDR yang valid untuk kode BEI ini. Periksa listing .JK dan tanggal harganya; harga tersimpan tetap dipertahankan.",
  knownNetWorth: "Subtotal yang diketahui",
  cashAssets: "Aset kas",
  stockAssets: "Saham yang sudah dinilai",
  receivableAssets: "Sisa piutang",
  debtLiabilities: "Sisa utang",
  reservedCash: "Kas dialokasikan",
  netWorthRule:
    "Alokasi tujuan dan dana sudah termasuk dalam kas, bukan aset tambahan.",
  incompleteNetWorth:
    "Kekayaan bersih belum lengkap karena sebagian saham belum memiliki harga.",
  viewNetWorth: "Lihat kekayaan bersih",
  assetsAndLiabilities: "Aset dan kewajiban",
  accountBreakdown: "Akun kas",
  outstandingObligations: "Sisa utang dan piutang",
  noObligations: "Tidak ada kewajiban tersisa.",
  noCalendarEvents: "Tidak ada jadwal bulan ini",
  calendarHint:
    "Tanggal rencana, bukan transaksi tercatat. Jatuh tempo utang dan target dana adalah pengingat dan bisa beririsan dengan pembayaran rutin.",
  agenda: "Agenda",
  recurring: "Jadwal rutin",
  debtDue: "Utang jatuh tempo",
  receivableDue: "Piutang jatuh tempo",
  fundDue: "Target dana",
  eventsOn: "Jadwal pada {date}",
  noEventsOnDay: "Tidak ada jadwal pada tanggal ini.",
  calendarGoTo: "Kelola",
  monthPrevious: "Bulan sebelumnya",
  monthNext: "Bulan berikutnya",
  today: "Hari ini",
  simulateUntil: "Proyeksikan hingga",
  calculateExpenses: "Hitung proyeksi",
  calculating: "Menghitung...",
  simulationHint:
    "Dasar perhitungan memakai jadwal rutin aktif. Belanja di luar jadwal, jatuh tempo utang, dan perubahan investasi mendatang tidak otomatis termasuk.",
  calculatorHint:
    "Pemasukan dan pengeluaran rutin aktif dari kalender keuangan dihitung dari hari ini sampai tanggal pilihan. Jatuh tempo utang dan target dana tetap menjadi pengingat, jadi tidak dihitung agar tidak terhitung dua kali.",
  currentCashHint:
    "Ini adalah kas tercatat dari seluruh akun dan menjadi titik awal proyeksi.",
  addedIncome: "Pemasukan tambahan",
  additionalIncomeHint:
    "Tambahkan pemasukan satu kali untuk melihat dampaknya sebelum dicatat.",
  addIncome: "Tambah pemasukan",
  removeIncome: "Hapus pemasukan",
  incomeName: "Nama pemasukan",
  incomeAmount: "Nominal (IDR)",
  incomeDate: "Tanggal pemasukan",
  addedExpenses: "Pengeluaran tambahan",
  additionalExpenseHint:
    "Tambahkan pengeluaran satu kali untuk melihat dampaknya sebelum dicatat.",
  addExpense: "Tambah pengeluaran",
  removeExpense: "Hapus pengeluaran",
  expenseName: "Nama pengeluaran",
  expenseAmount: "Nominal (IDR)",
  expenseDate: "Tanggal pengeluaran",
  currentCash: "Kas saat ini",
  scheduledIncome: "Pemasukan terjadwal",
  scheduledExpenses: "Pengeluaran terjadwal",
  projectedCash: "Kas proyeksi",
  baseline: "Tanpa rencana tambahan",
  scenario: "Dengan rencana tambahan",
  scenarioDifference: "Perubahan saldo",
  plannedExpenseCount: "{count} rencana pengeluaran ditambahkan.",
  plannedIncomeCount: "{count} rencana pemasukan ditambahkan.",
  simulationOnly:
    "Hanya pratinjau. Tidak ada transaksi atau jadwal yang dibuat.",
  simulationStale:
    "Input atau data keuangan berubah. Jalankan perbandingan lagi.",
  negativeScenario:
    "Skenario ini membuat saldo kas negatif pada setidaknya satu bulan.",
  monthlyProjection: "Proyeksi bulanan",
  addFund: "Tambah sinking fund",
  editFund: "Ubah sinking fund",
  fundName: "Nama dana",
  fundExample: "Contoh: Pajak kendaraan tahunan",
  fundAccount: "Akun tempat uang disimpan",
  fundAllocation: "Dialokasikan",
  suggestedMonthlySaving: "Saran alokasi bulan ini",
  fundHint:
    "Alokasi atau pelepasan tidak memindahkan kas. Belanja mencatat pengeluaran nyata dari akun ini.",
  allocate: "Alokasikan",
  release: "Lepas alokasi",
  spend: "Belanja dari dana",
  fundHistory: "Riwayat dana",
  allocateMoney: "Alokasikan uang",
  releaseMoney: "Lepas alokasi uang",
  spendMoney: "Catat pengeluaran dana",
  fundSaved: "Sinking fund disimpan.",
  fundEntrySaved: "Riwayat dana diperbarui.",
  fundDeleted: "Sinking fund kosong dihapus.",
  noFunds: "Siapkan dana untuk kebutuhan berikutnya",
  noFundsHint:
    "Buat dana dengan tanggal target dan akun sumber, lalu alokasikan uang saat menabung.",
  noFundHistory: "Belum ada alokasi atau belanja.",
  fundDeleteHint:
    "Hanya dana tanpa riwayat yang bisa dihapus. Lepaskan alokasi yang tidak terpakai untuk tetap menjaga riwayat dana.",
  availableInAccount: "Belum dialokasikan di akun ini: {amount}",
  fundSpendHint:
    "Ini membuat pengeluaran hari ini. Jangan catat pembayaran yang sama lagi di Transaksi.",
  fundReleaseHint:
    "Uang yang dialokasikan kembali tersedia tanpa mencatat pemasukan.",
  fundAllocateHint:
    "Ini mencadangkan kas yang sudah ada untuk kebutuhan ini tanpa membuat pengeluaran.",
}

export const planningMessages: Record<Locale, Record<string, string>> = {
  en,
  id,
}
