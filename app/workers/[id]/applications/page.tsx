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
  Star,
  CheckCircle,
  Clock,
  Loader2,
  UserCheck,
  X
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

interface Application {
  id: string
  listing_id: string
  worker_id: string
  poster_id: string
  status: string
  worker_rating: number | null
  poster_rating: number | null
  poster_comment: string | null
  created_at: string
  completed_at: string | null
  worker?: {
    id: string
    full_name: string | null
    email: string
    avatar_url: string | null
  }
}

export default function ApplicationsPage() {
  const [listing, setListing] = useState<any>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [ratingAppId, setRatingAppId] = useState<string | null>(null)
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

      if (!listingData || listingData.user_id !== user.id) {
        router.push("/workers")
        return
      }

      setListing(listingData)

      // Fetch applications with worker profiles
      const { data: appsData } = await supabase
        .from("individual_job_applications")
        .select("*")
        .eq("listing_id", params.id)
        .order("created_at", { ascending: false })

      if (appsData) {
        // Fetch worker profiles
        const workerIds = appsData.map(a => a.worker_id)
        const { data: workersData } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .in("id", workerIds)

        const appsWithWorkers = appsData.map(app => ({
          ...app,
          worker: workersData?.find(w => w.id === app.worker_id)
        }))

        setApplications(appsWithWorkers)
      }

      setLoading(false)
    }
    fetchData()
  }, [params.id, router, supabase])

  const handleAccept = async (appId: string) => {
    setProcessingId(appId)

    const { error } = await supabase
      .from("individual_job_applications")
      .update({ status: "accepted" })
      .eq("id", appId)

    if (!error) {
      setApplications(applications.map(app => 
        app.id === appId ? { ...app, status: "accepted" } : app
      ))
    }

    setProcessingId(null)
  }

  const handleReject = async (appId: string) => {
    setProcessingId(appId)

    const { error } = await supabase
      .from("individual_job_applications")
      .update({ status: "rejected" })
      .eq("id", appId)

    if (!error) {
      setApplications(applications.map(app => 
        app.id === appId ? { ...app, status: "rejected" } : app
      ))
    }

    setProcessingId(null)
  }

  const handleComplete = async (appId: string) => {
    setRatingAppId(appId)
    setShowRatingDialog(true)
  }

  const handleSubmitRating = async () => {
    if (!ratingAppId) return
    setSubmittingRating(true)

    const { error } = await supabase
      .from("individual_job_applications")
      .update({
        status: "completed",
        poster_rating: rating,
        poster_comment: ratingComment,
        completed_at: new Date().toISOString(),
      })
      .eq("id", ratingAppId)

    if (!error) {
      setApplications(applications.map(app => 
        app.id === ratingAppId 
          ? { ...app, status: "completed", poster_rating: rating, poster_comment: ratingComment, completed_at: new Date().toISOString() } 
          : app
      ))
      setShowRatingDialog(false)
      setRatingAppId(null)
      setRating(5)
      setRatingComment("")
    }

    setSubmittingRating(false)
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

  return (
    <MobileShell
      title="Хүсэлтүүд"
      leftAction={
        <Button variant="ghost" size="icon" asChild>
          <Link href="/workers">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
      }
    >
      <div className="p-4 space-y-4">
        {/* Listing Info */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold text-foreground">{listing?.job_description || "Ажил"}</h2>
            {listing?.wage && (
              <p className="text-sm text-primary mt-1">
                {new Intl.NumberFormat("mn-MN").format(listing.wage)}₮
              </p>
            )}
          </CardContent>
        </Card>

        {/* Applications */}
        <h3 className="font-medium text-foreground">
          Ажил хийх хүсэлтүүд ({applications.length})
        </h3>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Хүсэлт ирээгүй байна</p>
            </CardContent>
          </Card>
        ) : (
          applications.map((app) => (
            <Card key={app.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Link href={`/user/${app.worker_id}`}>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={app.worker?.avatar_url || ""} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {app.worker?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <Link href={`/user/${app.worker_id}`} className="font-medium text-foreground hover:underline">
                      {app.worker?.full_name || "Хэрэглэгч"}
                    </Link>
                    <p className="text-xs text-muted-foreground">{app.worker?.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(app.created_at).toLocaleDateString("mn-MN")}
                    </p>

                    {/* Status Badge */}
                    <div className="mt-2">
                      {app.status === "pending" && (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Хүлээгдэж байна
                        </Badge>
                      )}
                      {app.status === "accepted" && (
                        <Badge className="bg-blue-500">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Зөвшөөрсөн
                        </Badge>
                      )}
                      {app.status === "rejected" && (
                        <Badge variant="destructive">
                          <X className="h-3 w-3 mr-1" />
                          Татгалзсан
                        </Badge>
                      )}
                      {app.status === "completed" && (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Дууссан
                        </Badge>
                      )}
                    </div>

                    {/* Poster's rating (shown after completion) */}
                    {app.status === "completed" && app.poster_rating && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-xs text-muted-foreground">Таны үнэлгээ:</span>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < app.poster_rating! ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Worker's rating (shown after they rated) */}
                    {app.status === "completed" && app.worker_rating && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-muted-foreground">Ажилчны үнэлгээ:</span>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < app.worker_rating! ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {app.status === "pending" && (
                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleAccept(app.id)}
                      disabled={processingId === app.id}
                    >
                      {processingId === app.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Зөвшөөрөх
                        </>
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => handleReject(app.id)}
                      disabled={processingId === app.id}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Татгалзах
                    </Button>
                  </div>
                )}

                {app.status === "accepted" && (
                  <Button 
                    size="sm" 
                    className="w-full mt-4 bg-green-600 hover:bg-green-700"
                    onClick={() => handleComplete(app.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Ажил дууссан гэж тэмдэглэх
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ажилчинд үнэлгээ өгөх</DialogTitle>
            <DialogDescription>
              Ажил гүйцэтгэсэн хүнд үнэлгээ өгнө үү
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
              Дуусгах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileShell>
  )
}
