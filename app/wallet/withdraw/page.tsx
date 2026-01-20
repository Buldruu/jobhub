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
  ArrowDownLeft, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  CreditCard
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function WithdrawPage() {
  const [user, setUser] = useState<any>(null)
  const [wallet, setWallet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    bankName: "",
    accountNumber: "",
    accountName: ""
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

      // Get wallet
      const { data: walletData } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .single()

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
    
    if (!amount || amount <= 0) {
      setError("Дүн оруулна уу")
      setSubmitting(false)
      return
    }

    if (amount > (wallet?.balance || 0)) {
      setError("Үлдэгдэл хүрэлцэхгүй байна")
      setSubmitting(false)
      return
    }

    if (!formData.bankName || !formData.accountNumber || !formData.accountName) {
      setError("Бүх талбарыг бөглөнө үү")
      setSubmitting(false)
      return
    }

    // Deduct from wallet
    await supabase
      .from("wallets")
      .update({ balance: wallet.balance - amount })
      .eq("user_id", user.id)

    // Create withdrawal transaction
    await supabase.from("wallet_transactions").insert({
      sender_id: user.id,
      receiver_id: null,
      amount: amount,
      type: "withdrawal",
      status: "pending",
      description: `Таталт: ${formData.bankName} - ${formData.accountNumber} (${formData.accountName})`
    })

    setSuccess(true)
    setSubmitting(false)
    setTimeout(() => router.push("/wallet"), 2000)
  }

  if (loading) {
    return (
      <MobileShell title="Таталт" showBack backHref="/wallet">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileShell>
    )
  }

  if (success) {
    return (
      <MobileShell title="Таталт" showBack backHref="/wallet">
        <div className="flex flex-col items-center justify-center h-64 p-4">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Хүсэлт илгээгдлээ!</h2>
          <p className="text-muted-foreground text-center">
            Таны таталт амжилттай. 1-5 минутын дотор банкны дансанд шилжинэ.
          </p>
        </div>
      </MobileShell>
    )
  }

  return (
    <MobileShell title="Таталт" showBack backHref="/wallet">
      <div className="p-4 space-y-4">
        {/* Balance Info */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Боломжит үлдэгдэл</p>
            <p className="text-2xl font-bold text-foreground">{formatMoney(wallet?.balance || 0)}</p>
          </CardContent>
        </Card>

        {/* Withdraw Form */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

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
                <Label htmlFor="bankName">Банкны нэр</Label>
                <Input
                  id="bankName"
                  placeholder="Хаан банк, Голомт банк..."
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Дансны дугаар</Label>
                <Input
                  id="accountNumber"
                  placeholder="1234567890"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName">Данс эзэмшигчийн нэр</Label>
                <Input
                  id="accountName"
                  placeholder="Бат Болд"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ArrowDownLeft className="h-4 w-4 mr-2" />
                )}
                Таталт хүсэх
              </Button>
            </form>
          </CardContent>
        </Card>

        <Alert>
          <CreditCard className="h-4 w-4" />
          <AlertDescription>
            Таталт 1-5 минутын дотор таны банкны дансанд шилжинэ.
          </AlertDescription>
        </Alert>
      </div>
    </MobileShell>
  )
}
