"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MobileShell } from "@/components/mobile-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Wallet, 
  Loader2,
  CheckCircle2,
  CreditCard,
  Building2,
  Info
} from "lucide-react"

const BANKS = [
  { value: "khan", label: "Хаан банк" },
  { value: "golomt", label: "Голомт банк" },
  { value: "tdb", label: "Худалдаа хөгжлийн банк" },
  { value: "state", label: "Төрийн банк" },
  { value: "xac", label: "ХасБанк" },
  { value: "capitron", label: "Капитрон банк" },
  { value: "arig", label: "Ариг банк" },
  { value: "bogd", label: "Богд банк" },
  { value: "chinggis", label: "Чингисхаан банк" },
  { value: "national", label: "Үндэсний хөрөнгө оруулалтын банк" },
]

export default function DepositPage() {
  const [wallet, setWallet] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    amount: "",
    bank: "",
    accountNumber: "",
    accountName: "",
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)

      let { data: walletData } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (!walletData) {
        const { data: newWallet } = await supabase
          .from("wallets")
          .insert({ user_id: user.id, balance: 0, escrow_balance: 0 })
          .select()
          .single()
        walletData = newWallet
      }
      setWallet(walletData)
      setLoading(false)
    }

    loadData()
  }, [router, supabase])

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("mn-MN").format(amount) + "₮"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    const amount = parseFloat(formData.amount)
    if (amount < 1) {
      setError("Хамгийн багадаа 1₮ орлого хийх боломжтой")
      setSubmitting(false)
      return
    }

    if (!formData.bank || !formData.accountNumber || !formData.accountName) {
      setError("Бүх талбарыг бөглөнө үү")
      setSubmitting(false)
      return
    }

    try {
      // Simulate bank processing (1-5 minutes in real scenario, instant for demo)
      // In production, this would integrate with a real payment gateway
      
      // Add to wallet balance
      const newBalance = (wallet?.balance || 0) + amount
      
      await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", user.id)

      // Create transaction record
      await supabase.from("wallet_transactions").insert({
        sender_id: user.id,
        receiver_id: user.id,
        amount: amount,
        type: "deposit",
        status: "completed",
        description: `Банкнаас орлого - ${BANKS.find(b => b.value === formData.bank)?.label}`
      })

      setSuccess(true)
      setTimeout(() => {
        router.push("/wallet")
      }, 2000)
    } catch (err) {
      setError("Алдаа гарлаа. Дахин оролдоно уу.")
    }

    setSubmitting(false)
  }

  if (loading) {
    return (
      <MobileShell title="Орлого" showBack backHref="/wallet">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileShell>
    )
  }

  if (success) {
    return (
      <MobileShell title="Орлого" showBack backHref="/wallet">
        <div className="flex flex-col items-center justify-center h-64 p-4">
          <div className="p-4 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Амжилттай!</h2>
          <p className="text-center text-muted-foreground">
            Таны орлого амжилттай хийгдлээ. 1-5 минутын дотор түрийвчинд орно.
          </p>
        </div>
      </MobileShell>
    )
  }

  return (
    <MobileShell title="Орлого" showBack backHref="/wallet">
      <div className="p-4 space-y-4">
        {/* Current Balance */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm opacity-80">Одоогийн үлдэгдэл</p>
                <p className="text-2xl font-bold">{formatMoney(wallet?.balance || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Орлого 1-5 минутын дотор таны түрийвчинд шилжинэ.
          </AlertDescription>
        </Alert>

        {/* Deposit Form */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Дүн (₮)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  min="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">Хамгийн бага: 1₮ (дээд хязгааргүй)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank">Банк сонгох</Label>
                <Select
                  value={formData.bank}
                  onValueChange={(value) => setFormData({ ...formData, bank: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Банк сонгоно уу" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANKS.map((bank) => (
                      <SelectItem key={bank.value} value={bank.value}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {bank.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Дансны дугаар</Label>
                <Input
                  id="accountNumber"
                  type="text"
                  placeholder="XXXX XXXX XXXX"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName">Данс эзэмшигчийн нэр</Label>
                <Input
                  id="accountName"
                  type="text"
                  placeholder="Овог Нэр"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Боловсруулж байна...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Орлого хийх
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MobileShell>
  )
}
