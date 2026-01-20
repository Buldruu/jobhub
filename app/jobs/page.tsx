"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MobileShell } from "@/components/mobile-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, FileText, Star, MapPin, Phone, Mail, Trash2, Eye } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface JobSeekerListing {
  id: string
  user_id: string
  last_name: string
  first_name: string
  education: string
  experience: string
  cv_url: string | null
  phone: string
  email: string
  created_at: string
  listing_type: string
}

export default function JobsPage() {
  const [listings, setListings] = useState<JobSeekerListing[]>([])
  const [myListings, setMyListings] = useState<JobSeekerListing[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)

      // Fetch all job seeker listings
      const { data: allListings } = await supabase
        .from("job_seeker_listings")
        .select("*")
        .eq("listing_type", "job")
        .order("created_at", { ascending: false })

      // Fetch user's own listings
      const { data: userListings } = await supabase
        .from("job_seeker_listings")
        .select("*")
        .eq("user_id", user.id)
        .eq("listing_type", "job")
        .order("created_at", { ascending: false })

      setListings(allListings || [])
      setMyListings(userListings || [])
      setLoading(false)
    }
    fetchData()
  }, [router, supabase])

  const handleDelete = async () => {
    if (!deleteId) return

    const { error } = await supabase
      .from("job_seeker_listings")
      .delete()
      .eq("id", deleteId)

    if (!error) {
      setMyListings(myListings.filter(l => l.id !== deleteId))
      setListings(listings.filter(l => l.id !== deleteId))
    }
    setDeleteId(null)
  }

  const ListingCard = ({ listing, showDelete = false }: { listing: JobSeekerListing; showDelete?: boolean }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">
              {listing.last_name} {listing.first_name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{listing.education}</p>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{listing.experience}</p>
            
            <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {listing.phone}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {listing.email}
              </span>
            </div>

            {listing.cv_url && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 bg-transparent"
                onClick={() => window.open(listing.cv_url!, "_blank")}
              >
                <FileText className="h-4 w-4 mr-1" />
                CV үзэх
              </Button>
            )}
          </div>

          {showDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteId(listing.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <MobileShell title="Ажил хайх" showBack>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </MobileShell>
    )
  }

  return (
    <MobileShell title="Ажил хайх" showBack>
      <div className="p-4">
        <div className="flex justify-end mb-4">
          <Button onClick={() => router.push("/jobs/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Зар нэмэх
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">Бүх зарууд</TabsTrigger>
            <TabsTrigger value="my">Миний зарууд</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            {listings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Зар байхгүй байна</p>
              </div>
            ) : (
              listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            )}
          </TabsContent>

          <TabsContent value="my" className="mt-4">
            {myListings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Та зар оруулаагүй байна</p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => router.push("/jobs/create")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Зар нэмэх
                </Button>
              </div>
            ) : (
              myListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} showDelete />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Зар устгах</AlertDialogTitle>
            <AlertDialogDescription>
              Та энэ зарыг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Болих</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Устгах
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MobileShell>
  )
}
