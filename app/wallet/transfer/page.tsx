"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MobileShell } from "@/components/mobile-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  Send, 
  Shield, 
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function TransferPage() {
  const [user, setUser] = useState<any>(null)
  const [wallet, setWallet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [transferType, setTransferType] = useState<"direct" | "escrow">("direct")
  const [formData, setFormData] = useState({
    receiverEmail: "",
    amount: "",
    description: ""
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

    // Find receiver by email
    const { data: receiverProfile } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("email", formData.receiverEmail)
      .single()

    if (!receiverProfile) {
      setError("Хүлээн авагч олдсонгүй")
      setSubmitting(false)
      return
    }

    if (receiverProfile.id === user.id) {
      setError("Өөртөө шилжүүлэх боломжгүй")
      setSubmitting(false)
      return
    }

    // Get or create receiver's wallet
    let { data: receiverWallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", receiverProfile.id)
      .single()

    if (!receiverWallet) {
      const { data: newWallet } = await supabase
        .from("wallets")
        .insert({ user_id: receiverProfile.id, balance: 0, escrow_balance: 0 })
        .select()
        .single()
      receiverWallet = newWallet
    }

    if (transferType === "direct") {
      // Direct transfer
      // Deduct from sender
      await supabase
        .from("wallets")
        .update({ balance: wallet.balance - amount })
        .eq("user_id", user.id)

      // Add to receiver
      await supabase
        .from("wallets")
        .update({ balance: receiverWallet.balance + amount })
        .eq("user_id", receiverProfile.id)

      // Create transaction record
      await supabase.from("wallet_transactions").insert({
        sender_id: user.id,
        receiver_id: receiverProfile.id,
        amount: amount,
        type: "transfer",
        status: "completed",
        description: formData.description || "Шилжүүлэг"
      })

      setSuccess(true)
      setTimeout(() => router.push("/wallet"), 2000)
    } else {
      // Escrow transfer
      // Deduct from sender balance, add to escrow balance
      await supabase
        .from("wallets")
        .update({ 
          balance: wallet.balance - amount,
          escrow_balance: (wallet.escrow_balance || 0) + amount
        })
        .eq("user_id", user.id)

      // Create escrow transaction
      await supabase.from("escrow_transactions").insert({
        sender_id: user.id,
        receiver_id: receiverProfile.id,
        amount: amount,
        status: "pending",
        sender_confirmed: false,
        receiver_confirmed: false,
        description: formData.description || "Барилт гүйлгээ"
      })

      // Create transaction record
      await supabase.from("wallet_transactions").insert({
        sender_id: user.id,
        receiver_id: receiverProfile.id,
        amount: amount,
        type: "escrow",
        status: "pending",
        description: formData.description || "Барилт гүйлгээ"
      })

      setSuccess(true)
      setTimeout(() => router.push("/wallet"), 2000)
    }

    setSubmitting(false)
  }

  if (loading) {
    return (
      <MobileShell title="Шилжүүлэг" showBack backHref="/wallet">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileShell>
    )
  }

  if (success) {
    return (
      <MobileShell title="Шилжүүлэг" showBack backHref="/wallet">
        <div className="flex flex-col items-center justify-center h-64 p-4">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Амжилттай!</h2>
          <p className="text-muted-foreground text-center">
            {transferType === "direct" 
              ? "Шилжүүлэг амжилттай хийгдлээ" 
              : "Барилт гүйлгээ үүсгэгдлээ"}
          </p>
        </div>
      </MobileShell>
    )
  }

  return (
    <MobileShell title="Шилжүүлэг" showBack backHref="/wallet">
      <div className="p-4 space-y-4">
        {/* Balance Info */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Боломжит үлдэгдэл</p>
            <p className="text-2xl font-bold text-foreground">{formatMoney(wallet?.balance || 0)}</p>
          </CardContent>
        </Card>

        {/* Transfer Type Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Шилжүүлгийн төрөл</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={transferType} 
              onValueChange={(v) => setTransferType(v as "direct" | "escrow")}
              className="space-y-3"
            >
              <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="direct" id="direct" className="mt-1" />
                <Label htmlFor="direct" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <Send className="h-4 w-4 text-primary" />
                    <span className="font-medium">Шууд шилжүүлэг</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Мөнгө шууд хүлээн авагч руу шилжинэ
                  </p>
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="escrow" id="escrow" className="mt-1" />
                <Label htmlFor="escrow" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">Барилт хийж шилжүүлэх</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ажил дууссан гэж хоёр тал зөвшөөрсөн үед мөнгө шилжинэ
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Transfer Form */}
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
                <Label htmlFor="email">Хүлээн авагчийн email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.receiverEmail}
                  onChange={(e) => setFormData({ ...formData, receiverEmail: e.target.value })}
                  required
                />
              </div>

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
                <p className="text-xs text-muted-foreground">
                  Хамгийн бага: 1₮ (дээд хязгааргүй)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Тайлбар (заавал биш)</Label>
                <Textarea
                  id="description"
                  placeholder="Гүйлгээний тайлбар..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : transferType === "direct" ? (
                  <Send className="h-4 w-4 mr-2" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                {transferType === "direct" ? "Шилжүүлэх" : "Барилт үүсгэх"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {transferType === "escrow" && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Барилт гүйлгээ үүсгэхэд таны мөнгө түр хадгалагдана. Ажил дууссан гэж хоёр тал зөвшөөрсөн үед хүлээн авагч руу шилжинэ.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </MobileShell>
  )
}
