"use client"

import { useEffect, useMemo, useState } from "react"

import { TransactionForm } from "@/components/transaction-form"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, formatDate, type TransactionType } from "@/lib/finance"
import type { Account, Transaction } from "@/lib/types"

const transactionLabels: Record<TransactionType, string> = {
  income: "Pemasukan",
  expense: "Pengeluaran",
  transfer: "Transfer",
}

const transactionColors: Record<TransactionType, string> = {
  income: "bg-emerald-100 text-emerald-800",
  expense: "bg-rose-100 text-rose-800",
  transfer: "bg-sky-100 text-sky-800",
}

export function TransactionList() {
  const { formatCurrency, formatDate, t } = useLanguage()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all")
  const [accountFilter, setAccountFilter] = useState("all")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState("")

  async function fetchData() {
    const [transactionsResponse, accountsResponse] = await Promise.all([fetch(`/api/transactions?page=${page}&limit=25`), fetch("/api/accounts")])

    if (!transactionsResponse.ok || !accountsResponse.ok) {
      setError(t("dataUnavailable"))
      return
    }

    const transactionData = await transactionsResponse.json()
    setTransactions(transactionData.items)
    setTotalPages(transactionData.totalPages)
    setAccounts(await accountsResponse.json())
    setError("")
  }

  useEffect(() => { void fetchData() }, [page])

  const accountsById = useMemo(() => new Map(accounts.map((account) => [account.id, account.name])), [accounts])
  const filteredTransactions = transactions.filter((transaction) => {
    const keyword = searchTerm.toLowerCase()
    const textMatches = transaction.description?.toLowerCase().includes(keyword) || transaction.category.toLowerCase().includes(keyword)
    const typeMatches = typeFilter === "all" || transaction.type === typeFilter
    const accountMatches = accountFilter === "all" || transaction.accountId === Number(accountFilter) || transaction.destinationAccountId === Number(accountFilter)
    const dateMatches = (!fromDate || transaction.date >= fromDate) && (!toDate || transaction.date <= toDate)

    return Boolean(textMatches) && typeMatches && accountMatches && dateMatches
  })
  const totalIncome = filteredTransactions.filter((transaction) => transaction.type === "income").reduce((total, transaction) => total + transaction.amount, 0)
  const totalExpense = filteredTransactions.filter((transaction) => transaction.type === "expense").reduce((total, transaction) => total + transaction.amount, 0)

  async function deleteTransaction(id: number) {
    if (!window.confirm(t("deleteTransactionConfirm"))) return

    const response = await fetch(`/api/transactions/${id}`, { method: "DELETE" })
    if (!response.ok) {
      setError(t("transactionDeleteFailed"))
      return
    }

    await fetchData()
    window.dispatchEvent(new Event("finance-data-changed"))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("transactionTitle")}</h2>
          <p className="text-muted-foreground">{t("transactionDescription")}</p>
        </div>
        <TransactionForm accounts={accounts} onSaved={fetchData} />
      </div>
      {accounts.length === 0 && <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{t("addAnAccountFirst")}</p>}
      {error && <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</p>}
      <div className="grid gap-3 md:grid-cols-3">
        <SummaryCard label={t("filteredIncome")} value={formatCurrency(totalIncome)} tone="text-emerald-700" />
        <SummaryCard label={t("filteredExpense")} value={formatCurrency(totalExpense)} tone="text-rose-700" />
        <SummaryCard label={t("filteredDifference")} value={formatCurrency(totalIncome - totalExpense)} tone={totalIncome - totalExpense >= 0 ? "text-emerald-700" : "text-rose-700"} />
      </div>
      <Card>
        <CardHeader><CardTitle>{t("transactionHistory")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <Input placeholder={t("searchTransactions")} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as "all" | TransactionType)}>
              <SelectTrigger><SelectValue placeholder={t("allTypes")} /></SelectTrigger>
              <SelectContent><SelectItem value="all">{t("allTypes")}</SelectItem><SelectItem value="income">{t("income")}</SelectItem><SelectItem value="expense">{t("expense")}</SelectItem><SelectItem value="transfer">{t("transfer")}</SelectItem></SelectContent>
            </Select>
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger><SelectValue placeholder={t("allAccounts")} /></SelectTrigger>
              <SelectContent><SelectItem value="all">{t("allAccounts")}</SelectItem>{accounts.map((account) => <SelectItem key={account.id} value={String(account.id)}>{account.name}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="date" aria-label={t("fromDate")} value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
            <Input type="date" aria-label={t("toDate")} value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/70 text-muted-foreground"><tr><th className="p-3 text-left font-medium">Tanggal</th><th className="p-3 text-left font-medium">Jenis</th><th className="p-3 text-left font-medium">Kategori</th><th className="p-3 text-left font-medium">Akun</th><th className="p-3 text-right font-medium">Jumlah</th><th className="p-3 text-right font-medium">Aksi</th></tr></thead>
              <tbody>
                {filteredTransactions.map((transaction) => <tr key={transaction.id} className="border-t"><td className="p-3 whitespace-nowrap">{formatDate(transaction.date)}</td><td className="p-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${transactionColors[transaction.type]}`}>{transactionLabels[transaction.type]}</span></td><td className="p-3"><div className="font-medium">{transaction.category}</div>{transaction.description && <div className="mt-1 text-xs text-muted-foreground">{transaction.description}</div>}</td><td className="p-3 text-muted-foreground">{transaction.type === "transfer" ? `${accountsById.get(transaction.accountId) ?? "Akun"} → ${accountsById.get(transaction.destinationAccountId ?? 0) ?? "Akun"}` : accountsById.get(transaction.accountId)}</td><td className={`p-3 text-right font-semibold ${transaction.type === "income" ? "text-emerald-700" : transaction.type === "expense" ? "text-rose-700" : "text-sky-700"}`}>{transaction.type === "income" ? "+" : transaction.type === "expense" ? "−" : ""}{formatCurrency(transaction.amount)}</td><td className="p-3"><div className="flex justify-end gap-2"><TransactionForm accounts={accounts} transaction={transaction} onSaved={fetchData} /><Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => void deleteTransaction(transaction.id)}>Hapus</Button></div></td></tr>)}
              </tbody>
            </table>
            {filteredTransactions.length === 0 && <p className="p-8 text-center text-muted-foreground">Tidak ada transaksi yang sesuai dengan filter.</p>}
          </div>
          <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Halaman {page} dari {totalPages}</span><div className="flex gap-2"><Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Sebelumnya</Button><Button variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Berikutnya</Button></div></div>
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  return <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{label}</p><p className={`mt-1 text-2xl font-bold ${tone}`}>{value}</p></CardContent></Card>
}
