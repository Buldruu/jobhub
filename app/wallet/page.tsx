"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MobileShell } from "@/components/mobile-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Send,
  Loader2,
  ChevronLeft
} from "lucide-react"
import Link from "next/link"

interface WalletData {
  id: string
  balance: number
  escrow_balance: number
}

interface Transaction {
  id: string
  type: string
  amount: number
  description: string | null
  status: string
  created_at: string
  sender_id: string | null
  receiver_id: string | null
}

interface EscrowTransaction {
  id: string
  amount: number
  description: string | null
  status: string
  sender_confirmed: boolean
  receiver_confirmed: boolean
  created_at: string
  sender_id: string
  receiver_id: string
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [escrowTransactions, setEscrowTransactions] = useState<EscrowTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
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

      // Get or create wallet
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

      // Get transactions
      const { data: txData } = await supabase
        .from("wallet_transactions")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(50)

      setTransactions(txData || [])

      // Get escrow transactions
      const { data: escrowData } = await supabase
        .from("escrow_transactions")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(50)

      setEscrowTransactions(escrowData || [])
      setLoading(false)
    }

    loadData()
  }, [router, supabase])

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("mn-MN").format(amount) + "₮"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 text-white">Амжилттай</Badge>
      case "pending":
        return <Badge className="bg-yellow-500 text-white">Хүлээгдэж буй</Badge>
      case "cancelled":
        return <Badge className="bg-red-500 text-white">Цуцлагдсан</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <MobileShell title="Түрийвч" showBack backHref="/">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileShell>
    )
  }

  return (
    <MobileShell title="Түрийвч" showBack backHref="/">
      <div className="p-4 space-y-4">
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-full">
                <Wallet className="h-6 w-6" />
              </div>
              <span className="text-lg font-medium">Үлдэгдэл</span>
            </div>
            <p className="text-3xl font-bold mb-4">
              {formatMoney(wallet?.balance || 0)}
            </p>
            
            {(wallet?.escrow_balance || 0) > 0 && (
              <div className="pt-3 border-t border-white/20">
                <p className="text-sm opacity-80">Барилт хийсэн мөнгө</p>
                <p className="text-xl font-semibold">
                  {formatMoney(wallet?.escrow_balance || 0)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button asChild className="h-14 flex-col gap-1 px-2">
            <Link href="/wallet/deposit">
              <ArrowDownLeft className="h-5 w-5" />
              <span className="text-xs">Орлого</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-14 flex-col gap-1 px-2 bg-transparent">
            <Link href="/wallet/transfer">
              <Send className="h-5 w-5" />
              <span className="text-xs">Шилжүүлэг</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-14 flex-col gap-1 px-2 bg-transparent">
            <Link href="/wallet/withdraw">
              <ArrowUpRight className="h-5 w-5" />
              <span className="text-xs">Таталт</span>
            </Link>
          </Button>
        </div>

        {/* Transactions Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Бүгд</TabsTrigger>
            <TabsTrigger value="transfers">Шилжүүлэг</TabsTrigger>
            <TabsTrigger value="escrow">Барилт</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {transactions.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Гүйлгээ байхгүй
                </CardContent>
              </Card>
            ) : (
              transactions.map((tx) => (
                <Card key={tx.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          tx.receiver_id === user?.id 
                            ? "bg-green-100 text-green-600" 
                            : "bg-red-100 text-red-600"
                        }`}>
                          {tx.receiver_id === user?.id ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {tx.type === "transfer" ? "Шилжүүлэг" : 
                             tx.type === "deposit" ? "Цэнэглэлт" : 
                             tx.type === "withdrawal" ? "Таталт" : tx.type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.created_at).toLocaleString("mn-MN")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          tx.receiver_id === user?.id ? "text-green-600" : "text-red-600"
                        }`}>
                          {tx.receiver_id === user?.id ? "+" : "-"}{formatMoney(tx.amount)}
                        </p>
                        {getStatusBadge(tx.status)}
                      </div>
                    </div>
                    {tx.description && (
                      <p className="text-sm text-muted-foreground mt-2">{tx.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="transfers" className="space-y-3 mt-4">
            {transactions.filter(t => t.type === "transfer").length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Шилжүүлэг байхгүй
                </CardContent>
              </Card>
            ) : (
              transactions
                .filter(t => t.type === "transfer")
                .map((tx) => (
                  <Card key={tx.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            tx.receiver_id === user?.id 
                              ? "bg-green-100 text-green-600" 
                              : "bg-red-100 text-red-600"
                          }`}>
                            {tx.receiver_id === user?.id ? (
                              <ArrowDownLeft className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Шилжүүлэг</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(tx.created_at).toLocaleString("mn-MN")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            tx.receiver_id === user?.id ? "text-green-600" : "text-red-600"
                          }`}>
                            {tx.receiver_id === user?.id ? "+" : "-"}{formatMoney(tx.amount)}
                          </p>
                          {getStatusBadge(tx.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          <TabsContent value="escrow" className="space-y-3 mt-4">
            {escrowTransactions.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Барилт гүйлгээ байхгүй
                </CardContent>
              </Card>
            ) : (
              escrowTransactions.map((tx) => (
                <EscrowCard 
                  key={tx.id} 
                  transaction={tx} 
                  userId={user?.id} 
                  formatMoney={formatMoney}
                  onUpdate={() => window.location.reload()}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MobileShell>
  )
}

function EscrowCard({ 
  transaction, 
  userId, 
  formatMoney,
  onUpdate 
}: { 
  transaction: EscrowTransaction
  userId: string
  formatMoney: (n: number) => string
  onUpdate: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  const supabase = createClient()
  const isSender = transaction.sender_id === userId
  const isReceiver = transaction.receiver_id === userId

  const handleConfirm = async () => {
    setConfirming(true)
    
    const updateField = isSender ? "sender_confirmed" : "receiver_confirmed"
    
    await supabase
      .from("escrow_transactions")
      .update({ [updateField]: true })
      .eq("id", transaction.id)

    // Check if both confirmed
    const { data: updated } = await supabase
      .from("escrow_transactions")
      .select("*")
      .eq("id", transaction.id)
      .single()

    if (updated && updated.sender_confirmed && updated.receiver_confirmed) {
      // Release funds to receiver
      // Get receiver's wallet
      const { data: receiverWallet } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", transaction.receiver_id)
        .single()

      if (receiverWallet) {
        // Add to receiver's balance
        await supabase
          .from("wallets")
          .update({ balance: receiverWallet.balance + transaction.amount })
          .eq("user_id", transaction.receiver_id)
      }

      // Reduce sender's escrow balance
      const { data: senderWallet } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", transaction.sender_id)
        .single()

      if (senderWallet) {
        await supabase
          .from("wallets")
          .update({ escrow_balance: senderWallet.escrow_balance - transaction.amount })
          .eq("user_id", transaction.sender_id)
      }

      // Update escrow status
      await supabase
        .from("escrow_transactions")
        .update({ status: "completed" })
        .eq("id", transaction.id)

      // Create transaction record
      await supabase.from("wallet_transactions").insert({
        sender_id: transaction.sender_id,
        receiver_id: transaction.receiver_id,
        amount: transaction.amount,
        type: "escrow_release",
        status: "completed",
        description: "Барилт гүйлгээ дууссан"
      })
    }

    setConfirming(false)
    onUpdate()
  }

  const myConfirmed = isSender ? transaction.sender_confirmed : transaction.receiver_confirmed

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-100 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-foreground">Барилт гүйлгээ</p>
              <p className="text-xs text-muted-foreground">
                {new Date(transaction.created_at).toLocaleString("mn-MN")}
              </p>
            </div>
          </div>
          <p className="font-semibold text-foreground">{formatMoney(transaction.amount)}</p>
        </div>

        {transaction.description && (
          <p className="text-sm text-muted-foreground mb-3">{transaction.description}</p>
        )}

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            {transaction.sender_confirmed ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-xs">Илгээгч</span>
          </div>
          <div className="flex items-center gap-1">
            {transaction.receiver_confirmed ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-xs">Хүлээн авагч</span>
          </div>
        </div>

        {transaction.status === "pending" && !myConfirmed && (
          <Button 
            onClick={handleConfirm} 
            disabled={confirming}
            className="w-full"
            size="sm"
          >
            {confirming ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Ажил дууссан гэж зөвшөөрөх
          </Button>
        )}

        {transaction.status === "completed" && (
          <Badge className="bg-green-500 text-white w-full justify-center py-1">
            Амжилттай дууссан
          </Badge>
        )}

        {myConfirmed && transaction.status === "pending" && (
          <Badge variant="secondary" className="w-full justify-center py-1">
            Нөгөө талын зөвшөөрлийг хүлээж байна
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
