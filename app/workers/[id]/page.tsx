"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MobileShell } from "@/components/mobile-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Banknote, 
  Star,
  User,
  CheckCircle,
  Clock,
  Loader2
} from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function IndividualJobDetailPage() {
  const [listing, setListing] = useState<any>(null)
  const [poster, setPoster] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [application, setApplication] = useState<any>(null)
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [rating, setRating] = useState(5)
  const [ratingComment, setRatingComment] = useState("")
  const [submittingRating, setSubmittingRating] = useState(false)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)

      // Fetch listing
      const { data: listingData } = await supabase
        .from("job_seeker_listings")
        .select("*")
        .eq("id", params.id)
        .single()

      if (listingData) {
        setListing(listingData)

        // Fetch poster info
        const { data: posterData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", listingData.user_id)
          .single()
        
        setPoster(posterData)

        // Check if user has applied
        const { data: appData } = await supabase
          .from("individual_job_applications")
          .select("*")
          .eq("listing_id", params.id)
          .eq("worker_id", user.id)
          .single()

        if (appData) {
          setHasApplied(true)
          setApplication(appData)
        }
      }

      setLoading(false)
    }
    fetchData()
  }, [params.id, router, supabase])

  const handleApply = async () => {
    if (!user || !listing) return
    setApplying(true)

    const { error } = await supabase.from("individual_job_applications").insert({
      listing_id: listing.id,
      poster_id: listing.user_id,
      worker_id: user.id,
    })

    if (!error) {
      setHasApplied(true)
      const { data } = await supabase
        .from("individual_job_applications")
        .select("*")
        .eq("listing_id", listing.id)
        .eq("worker_id", user.id)
        .single()
      setApplication(data)
    }

    setApplying(false)
  }

  const handleSubmitRating = async () => {
    if (!application) return
    setSubmittingRating(true)

    const { error } = await supabase
      .from("individual_job_applications")
      .update({
        worker_rating: rating,
        worker_comment: ratingComment,
      })
      .eq("id", application.id)

    if (!error) {
      setApplication({ ...application, worker_rating: rating, worker_comment: ratingComment })
      setShowRatingDialog(false)
    }

    setSubmittingRating(false)
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("mn-MN").format(amount) + "₮"
  }

  if (loading) {
    return (
      <MobileShell title="Ачааллаж байна...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileShell>
    )
  }

  if (!listing) {
    return (
      <MobileShell title="Олдсонгүй">
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Зар олдсонгүй</p>
          <Button asChild className="mt-4">
            <Link href="/workers">Буцах</Link>
          </Button>
        </div>
      </MobileShell>
    )
  }

  const isOwner = user?.id === listing.user_id

  return (
    <MobileShell
      title="Ажлын дэлгэрэнгүй"
      leftAction={
        <Button variant="ghost" size="icon" asChild>
          <Link href="/workers">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
      }
    >
      <div className="p-4 space-y-4 pb-24">
        {/* Job Info */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="secondary" className="mb-2">Хувь хүн</Badge>
                <h2 className="text-xl font-bold text-foreground">{listing.job_description || "Ажил"}</h2>
              </div>
              {listing.wage && (
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{formatMoney(listing.wage)}</p>
                  <p className="text-xs text-muted-foreground">Ажлын хөлс</p>
                </div>
              )}
            </div>

            {listing.additional_info && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-1">Нэмэлт мэдээлэл</h3>
                <p className="text-sm text-muted-foreground">{listing.additional_info}</p>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              {listing.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${listing.phone}`} className="text-primary">{listing.phone}</a>
                </div>
              )}
              {listing.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${listing.email}`} className="text-primary">{listing.email}</a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Poster Info */}
        {poster && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-foreground mb-3">Нийтэлсэн хүн</h3>
              <Link href={`/user/${poster.id}`} className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={poster.avatar_url || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {poster.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{poster.full_name || "Хэрэглэгч"}</p>
                  <p className="text-xs text-muted-foreground">{poster.email}</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Application Status */}
        {!isOwner && hasApplied && application && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-foreground mb-3">Таны хүсэлт</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {application.status === "pending" && (
                    <>
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Хүлээгдэж байна</span>
                    </>
                  )}
                  {application.status === "accepted" && (
                    <>
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Зөвшөөрөгдсөн - Ажил хийгдэж байна</span>
                    </>
                  )}
                  {application.status === "completed" && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Дууссан</span>
                    </>
                  )}
                </div>

                {application.status === "completed" && !application.worker_rating && (
                  <Button onClick={() => setShowRatingDialog(true)} className="w-full mt-2">
                    <Star className="h-4 w-4 mr-2" />
                    Үнэлгээ өгөх
                  </Button>
                )}

                {application.worker_rating && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-sm text-muted-foreground">Таны үнэлгээ:</span>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < application.worker_rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Apply Button */}
      {!isOwner && !hasApplied && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <Button onClick={handleApply} disabled={applying} className="w-full h-12">
            {applying ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <User className="h-5 w-5 mr-2" />
            )}
            Ажил хийх хүсэлт илгээх
          </Button>
        </div>
      )}

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Үнэлгээ өгөх</DialogTitle>
            <DialogDescription>
              Ажил олгогчид үнэлгээ өгнө үү
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)}>
                  <Star
                    className={`h-8 w-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                  />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Сэтгэгдэл (заавал биш)"
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
              Болих
            </Button>
            <Button onClick={handleSubmitRating} disabled={submittingRating}>
              {submittingRating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Илгээх
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileShell>
  )
}
