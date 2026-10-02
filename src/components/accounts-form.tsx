import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { accountTypes, type AccountType } from "@/lib/finance"

const accountLabels: Record<AccountType, string> = {
  cash: "Tunai",
  bank: "Bank",
  investment: "Investasi",
  ewallet: "E-wallet",
  other: "Lainnya",
}

export function AddAccountForm({ onAdded }: { onAdded?: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<AccountType | "">("")
  const [initialBalance, setInitialBalance] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError("")
    const response = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, initialBalance, description }),
    })
    setLoading(false)

    if (!response.ok) {
      const result = await response.json().catch(() => null)
      setError(result?.error ?? "Akun tidak dapat disimpan.")
      return
    }

    setOpen(false)
    setName("")
    setType("")
    setInitialBalance("")
    setDescription("")
    onAdded?.()
    window.dispatchEvent(new Event("finance-data-changed"))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>Tambah akun</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Tambah akun</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Nama akun, misalnya BCA" value={name} onChange={(event) => setName(event.target.value)} required />
          <Select value={type} onValueChange={(value) => setType(value as AccountType)} required>
            <SelectTrigger><SelectValue placeholder="Pilih tipe akun" /></SelectTrigger>
            <SelectContent>{accountTypes.map((item) => <SelectItem key={item} value={item}>{accountLabels[item]}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="number" step="1" inputMode="numeric" placeholder="Saldo awal (opsional)" value={initialBalance} onChange={(event) => setInitialBalance(event.target.value)} />
          <Input placeholder="Catatan (opsional)" value={description} onChange={(event) => setDescription(event.target.value)} />
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <DialogFooter><Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan akun"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
