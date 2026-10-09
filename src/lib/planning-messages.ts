import type { Locale } from "./finance"

const en = {
  helpInvestments: "Track brokerage cash and stocks",
  helpInvestmentsBody:
    "Enter brokerage cash as your opening balance, then record stock purchases and sales with their fees. Check the price date when reviewing market values.",
  helpNetWorth: "See your net worth",
  helpNetWorthBody:
    "Net worth adds cash, valued stocks, and receivables, then subtracts unpaid debts. Money allocated to goals or sinking funds is already included in cash.",
  helpSimulation: "Compare spending plans",
  helpSimulationBody:
    "Combine current cash and scheduled cash flow with planned income and expenses to preview your future balance.",
  helpCalendar: "See upcoming financial dates",
  helpCalendarBody:
    "Browse recurring schedules, debt deadlines, and fund targets by month. Check transaction history for recorded payments.",
  helpFunds: "Reserve money for predictable expenses",
  helpFundsBody:
    "Allocate cash to a fund in its source account. Release makes it available again. Spend records the payment directly in Transactions.",
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
    "Preview your future balance from current cash, recurring schedules, and planned income and expenses.",
  fundsDescription:
    "Set money aside for predictable expenses such as annual insurance, vehicle tax, or a holiday.",
  totalBalance: "Cash across accounts",
  accountBalance: "Cash by account",
  accountBalanceDescription:
    "Opening cash and recorded cash flows. Stock holdings are valued separately.",
  balanceProgressDescription:
    "Cash balance after recorded transactions and stock purchases or sales.",
  investmentOpeningHint:
    "Enter the cash available in your brokerage account. Record stock purchases in Investments.",
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
    "Enter the four-letter IDX symbol, such as BBCA, for the stock trade you have completed.",
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
    "{count} holding(s) are awaiting market prices. The portfolio total covers holdings with available prices.",
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
    "Add an account with your available brokerage cash, then record your first stock purchase.",
  noWatchlist: "What stocks are you following?",
  noWatchlistHint:
    "Add IDX symbols to follow their daily prices.",
  noTrades: "No stock trades yet.",
  tradeDeleteHint:
    "Permanently delete this trade and recalculate cash, cost basis, and gains. Later trades must still have sufficient shares and cash.",
  removeWatchHint:
    "Permanently remove this watchlist entry and note. Your trades and holdings stay unchanged; you can add the ticker again.",
  corporateActionsHint:
    "Holdings are calculated from recorded purchases and sales. Review your holdings after a stock split or other corporate action.",
  insufficientShares:
    "This sale exceeds the shares owned on its date. Check the account, quantity, and earlier trades.",
  insufficientCash:
    "This action would leave insufficient cash. Check opening cash and transactions, or record the funding transfer first.",
  insufficientAvailableCash:
    "This amount exceeds your unallocated cash. Review the money reserved for goals and sinking funds.",
  fundBalanceExceeded: "The amount exceeds the money allocated to this fund.",
  fundTargetExceeded:
    "The allocation exceeds the target, or the target is below the existing allocation.",
  linkedFundTransaction:
    "This expense is linked to a sinking fund. Manage its payment through the fund history.",
  marketDataUnavailable:
    "Daily prices are temporarily unavailable from Yahoo Finance. Your saved prices remain available. Try again later.",
  priceAccessRequired:
    "Yahoo Finance has temporarily restricted access. Your saved prices remain available. Wait a moment, then try again.",
  pricesRateLimited:
    "The market-data limit was reached. Existing prices were kept; wait for your provider quota to reset, then retry.",
  invalidMarketPrice:
    "A daily closing price is pending for this stock. Check the ticker and price date, then try again. Your saved prices remain available.",
  knownNetWorth: "Known subtotal",
  cashAssets: "Cash assets",
  stockAssets: "Valued stocks",
  receivableAssets: "Outstanding receivables",
  debtLiabilities: "Outstanding debts",
  reservedCash: "Allocated cash",
  netWorthRule:
    "Cash includes the money allocated to goals and sinking funds.",
  incompleteNetWorth:
    "This subtotal covers cash, receivables, debts, and stocks with available prices. Some holdings are awaiting prices.",
  viewNetWorth: "View net worth",
  assetsAndLiabilities: "Assets and liabilities",
  accountBreakdown: "Cash accounts",
  outstandingObligations: "Outstanding debts and receivables",
  noObligations: "No outstanding obligations.",
  noCalendarEvents: "No scheduled events this month",
  calendarHint:
    "The calendar shows planned dates. Match debt and fund reminders with recurring schedules when reviewing upcoming payments.",
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
    "The starting projection uses active recurring schedules. Add other planned income and spending to see their effect.",
  calculatorHint:
    "Active recurring income and expenses are calculated from today through the selected date. Debt deadlines and fund targets are calendar reminders. Match additional plans with the schedules already included.",
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
  baseline: "Recurring schedules",
  scenario: "With extra plans",
  scenarioDifference: "Change in balance",
  plannedExpenseCount: "{count} planned expense(s) added.",
  plannedIncomeCount: "{count} planned income(s) added.",
  simulationOnly: "Balance projection calculated.",
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
    "Allocations reserve cash in this account. Release makes it available again, and Spend records an expense.",
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
    "An empty fund with no history can be deleted permanently. Release unused allocations to make the money available again.",
  availableInAccount: "Unallocated in this account: {amount}",
  fundSpendHint:
    "This records today's expense in Transactions and updates the fund balance.",
  fundReleaseHint:
    "Release the allocation to make this cash available for other uses in the same account.",
  fundAllocateHint:
    "Reserve existing cash in this account for the fund.",
}

const id: Record<keyof typeof en, string> = {
  helpInvestments: "Pantau kas sekuritas dan saham",
  helpInvestmentsBody:
    "Masukkan kas sekuritas sebagai saldo awal, lalu catat pembelian dan penjualan saham beserta biayanya. Periksa tanggal harga saat meninjau nilai pasar.",
  helpNetWorth: "Lihat kekayaan bersih Anda",
  helpNetWorthBody:
    "Kekayaan bersih menjumlahkan kas, saham yang sudah dinilai, dan piutang, lalu mengurangi sisa utang. Alokasi tujuan dan sinking funds sudah termasuk kas.",
  helpSimulation: "Bandingkan rencana pengeluaran",
  helpSimulationBody:
    "Gabungkan kas saat ini dan arus kas terjadwal dengan rencana pemasukan dan pengeluaran untuk melihat proyeksi saldo.",
  helpCalendar: "Lihat tanggal keuangan mendatang",
  helpCalendarBody:
    "Telusuri jadwal rutin, jatuh tempo utang, dan target dana per bulan. Lihat riwayat transaksi untuk pembayaran yang sudah dicatat.",
  helpFunds: "Cadangkan uang untuk kebutuhan terencana",
  helpFundsBody:
    "Alokasikan kas ke dana di akun sumbernya. Lepas alokasi agar kas tersedia lagi. Belanja langsung mencatat pembayaran di Transaksi.",
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
    "Lihat proyeksi saldo dari kas saat ini, jadwal rutin, dan rencana pemasukan serta pengeluaran.",
  fundsDescription:
    "Sisihkan uang untuk kebutuhan terencana seperti premi tahunan, pajak kendaraan, atau liburan.",
  totalBalance: "Kas seluruh akun",
  accountBalance: "Kas per akun",
  accountBalanceDescription:
    "Saldo kas awal dan arus kas tercatat. Kepemilikan saham dinilai terpisah.",
  balanceProgressDescription:
    "Perubahan saldo kas dari transaksi tercatat serta pembelian dan penjualan saham.",
  investmentOpeningHint:
    "Masukkan kas yang tersedia di akun sekuritas. Catat pembelian saham di Investasi.",
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
    "Masukkan kode empat huruf BEI, misalnya BBCA, untuk transaksi saham yang sudah dilakukan.",
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
    "{count} kepemilikan menunggu harga pasar. Total portofolio mencakup saham dengan harga tersedia.",
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
    "Tambahkan akun dengan kas sekuritas yang tersedia, lalu catat pembelian saham pertama Anda.",
  noWatchlist: "Saham apa yang Anda pantau?",
  noWatchlistHint:
    "Tambahkan kode saham BEI untuk memantau harga harian.",
  noTrades: "Belum ada transaksi saham.",
  tradeDeleteHint:
    "Hapus transaksi saham secara permanen dan hitung ulang kas, modal, serta hasilnya. Transaksi berikutnya tetap membutuhkan saham dan kas yang cukup.",
  removeWatchHint:
    "Hapus entri watchlist dan catatan ini secara permanen. Transaksi dan kepemilikan saham tetap tersimpan; kode saham bisa ditambahkan lagi.",
  corporateActionsHint:
    "Kepemilikan dihitung dari pembelian dan penjualan tercatat. Periksa kepemilikan setelah stock split atau aksi korporasi lain.",
  insufficientShares:
    "Penjualan melebihi saham yang dimiliki pada tanggalnya. Periksa akun, jumlah, dan transaksi sebelumnya.",
  insufficientCash:
    "Kas tidak cukup untuk tindakan ini. Periksa saldo awal dan transaksi, atau catat transfer pendanaan terlebih dahulu.",
  insufficientAvailableCash:
    "Nominal melebihi kas yang tersedia untuk dialokasikan. Periksa dana yang dicadangkan untuk tujuan dan sinking funds.",
  fundBalanceExceeded:
    "Nominal melebihi uang yang dialokasikan untuk dana ini.",
  fundTargetExceeded:
    "Alokasi melebihi target, atau target lebih kecil daripada alokasi yang sudah ada.",
  linkedFundTransaction:
    "Pengeluaran ini terhubung ke sinking fund. Kelola pembayarannya melalui riwayat dana.",
  marketDataUnavailable:
    "Harga harian dari Yahoo Finance sedang bermasalah. Harga tersimpan tetap tersedia. Coba lagi nanti.",
  priceAccessRequired:
    "Yahoo Finance membatasi akses sementara. Harga tersimpan tetap tersedia. Tunggu sebentar, lalu coba lagi.",
  pricesRateLimited:
    "Batas data pasar tercapai. Harga sebelumnya tetap disimpan; tunggu kuota penyedia pulih, lalu coba lagi.",
  invalidMarketPrice:
    "Harga penutupan harian saham ini belum tersedia. Periksa kode saham dan tanggal harga, lalu coba lagi. Harga tersimpan tetap tersedia.",
  knownNetWorth: "Subtotal yang diketahui",
  cashAssets: "Aset kas",
  stockAssets: "Saham yang sudah dinilai",
  receivableAssets: "Sisa piutang",
  debtLiabilities: "Sisa utang",
  reservedCash: "Kas dialokasikan",
  netWorthRule:
    "Kas mencakup uang yang dialokasikan untuk tujuan dan sinking funds.",
  incompleteNetWorth:
    "Subtotal ini mencakup kas, piutang, utang, dan saham dengan harga tersedia. Sebagian kepemilikan masih menunggu harga.",
  viewNetWorth: "Lihat kekayaan bersih",
  assetsAndLiabilities: "Aset dan kewajiban",
  accountBreakdown: "Akun kas",
  outstandingObligations: "Sisa utang dan piutang",
  noObligations: "Tidak ada kewajiban tersisa.",
  noCalendarEvents: "Tidak ada jadwal bulan ini",
  calendarHint:
    "Kalender menampilkan tanggal rencana. Cocokkan pengingat utang dan dana dengan jadwal rutin saat meninjau pembayaran mendatang.",
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
    "Proyeksi awal memakai jadwal rutin aktif. Tambahkan rencana pemasukan dan belanja lainnya untuk melihat dampaknya.",
  calculatorHint:
    "Pemasukan dan pengeluaran rutin aktif dihitung dari hari ini sampai tanggal pilihan. Jatuh tempo utang dan target dana menjadi pengingat di kalender. Cocokkan rencana tambahan dengan jadwal yang sudah dihitung.",
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
  baseline: "Jadwal rutin",
  scenario: "Dengan rencana tambahan",
  scenarioDifference: "Perubahan saldo",
  plannedExpenseCount: "{count} rencana pengeluaran ditambahkan.",
  plannedIncomeCount: "{count} rencana pemasukan ditambahkan.",
  simulationOnly:
    "Proyeksi saldo selesai dihitung.",
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
    "Alokasi mencadangkan kas di akun ini. Lepas alokasi membuatnya tersedia lagi, dan Belanja mencatat pengeluaran.",
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
    "Dana kosong yang belum memiliki riwayat bisa dihapus permanen. Lepaskan sisa alokasi agar uang tersedia kembali.",
  availableInAccount: "Belum dialokasikan di akun ini: {amount}",
  fundSpendHint:
    "Pembayaran ini langsung dicatat sebagai pengeluaran hari ini di Transaksi dan memperbarui saldo dana.",
  fundReleaseHint:
    "Lepas alokasi agar kas bisa digunakan untuk kebutuhan lain di akun yang sama.",
  fundAllocateHint:
    "Cadangkan kas yang tersedia di akun ini untuk dana tersebut.",
}

export const planningMessages: Record<Locale, Record<string, string>> = {
  en,
  id,
}
