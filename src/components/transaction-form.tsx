import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { expenseCategories, getToday, incomeCategories, type TransactionType } from "@/lib/finance"
import type { Account, Transaction } from "@/lib/types"

type TransactionFormProps = {
  accounts: Account[]
  transaction?: Transaction
  onSaved: () => void
}

const categories: Record<TransactionType, readonly string[]> = {
  income: incomeCategories,
  expense: expenseCategories,
  transfer: ["Transfer antar akun"],
}

export function TransactionForm({ accounts, transaction, onSaved }: TransactionFormProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<TransactionType>(transaction?.type ?? "expense")
  const [amount, setAmount] = useState(transaction?.amount ? String(transaction.amount) : "")
  const [category, setCategory] = useState(transaction?.category ?? "")
  const [accountId, setAccountId] = useState(transaction?.accountId ? String(transaction.accountId) : "")
  const [destinationAccountId, setDestinationAccountId] = useState(transaction?.destinationAccountId ? String(transaction.destinationAccountId) : "")
  const [description, setDescription] = useState(transaction?.description ?? "")
  const [date, setDate] = useState(transaction?.date ?? getToday())
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    setType(transaction?.type ?? "expense")
    setAmount(transaction?.amount ? String(transaction.amount) : "")
    setCategory(transaction?.category ?? "")
    setAccountId(transaction?.accountId ? String(transaction.accountId) : "")
    setDestinationAccountId(transaction?.destinationAccountId ? String(transaction.destinationAccountId) : "")
    setDescription(transaction?.description ?? "")
    setDate(transaction?.date ?? getToday())
    setError("")
  }, [open, transaction])

  function handleTypeChange(value: TransactionType) {
    setType(value)
    setCategory("")
    setDestinationAccountId("")
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError("")

    const response = await fetch(transaction ? `/api/transactions/${transaction.id}` : "/api/transactions", {
      method: transaction ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        amount,
        category,
        accountId,
        destinationAccountId: type === "transfer" ? destinationAccountId : null,
        description,
        date,
      }),
    })
    setLoading(false)

    if (!response.ok) {
      const result = await response.json().catch(() => null)
      setError(result?.error ?? "Transaksi tidak dapat disimpan.")
      return
    }

    setOpen(false)
    onSaved()
    window.dispatchEvent(new Event("finance-data-changed"))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={transaction ? "outline" : "default"}>{transaction ? "Ubah" : "Tambah transaksi"}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction ? "Ubah transaksi" : "Catat transaksi"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select value={type} onValueChange={(value) => handleTypeChange(value as TransactionType)} required>
            <SelectTrigger><SelectValue placeholder="Jenis transaksi" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Pemasukan</SelectItem>
              <SelectItem value="expense">Pengeluaran</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
          <Input type="number" min="1" step="1" inputMode="numeric" placeholder="Jumlah" value={amount} onChange={(event) => setAmount(event.target.value)} required />
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
            <SelectContent>
              {categories[type].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={accountId} onValueChange={setAccountId} required>
            <SelectTrigger><SelectValue placeholder={type === "transfer" ? "Akun asal" : "Pilih akun"} /></SelectTrigger>
            <SelectContent>
              {accounts.map((account) => <SelectItem key={account.id} value={String(account.id)}>{account.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {type === "transfer" && (
            <Select value={destinationAccountId} onValueChange={setDestinationAccountId} required>
              <SelectTrigger><SelectValue placeholder="Akun tujuan" /></SelectTrigger>
              <SelectContent>
                {accounts.filter((account) => String(account.id) !== accountId).map((account) => (
                  <SelectItem key={account.id} value={String(account.id)}>{account.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
          <Input placeholder="Catatan (opsional)" value={description} onChange={(event) => setDescription(event.target.value)} />
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading || accounts.length === 0}>{loading ? "Menyimpan..." : "Simpan transaksi"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
