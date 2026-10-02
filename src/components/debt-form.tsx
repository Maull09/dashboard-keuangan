import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AddDebtForm({ onAdded }: { onAdded?: () => void }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<"utang" | "piutang">("utang")
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/debts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, name, amount, description, dueDate }),
    })
    setLoading(false)
    if (res.ok) {
      setOpen(false)
      setType("utang")
      setName("")
      setAmount("")
      setDescription("")
      setDueDate("")
      onAdded?.()
    } else {
      alert("Gagal menambah utang/piutang")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">+ Tambah Utang/Piutang</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Utang/Piutang</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select value={type} onValueChange={v => setType(v as any)} required>
            <SelectTrigger>
              <SelectValue placeholder="Jenis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="utang">Utang (saya berutang)</SelectItem>
              <SelectItem value="piutang">Piutang (orang berutang ke saya)</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Nama Pemberi/Penerima" value={name} onChange={e => setName(e.target.value)} required />
          <Input type="number" placeholder="Jumlah" value={amount} onChange={e => setAmount(e.target.value)} required />
          <Input placeholder="Deskripsi (opsional)" value={description} onChange={e => setDescription(e.target.value)} />
          <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          <DialogFooter>
            <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}