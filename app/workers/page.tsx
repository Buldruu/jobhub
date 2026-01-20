"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MobileShell } from "@/components/mobile-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Phone, Mail, Trash2, Building2, User, MapPin, Banknote, Briefcase, Users } from "lucide-react"
import Link from "next/link"
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

interface WorkerListing {
  id: string
  user_id: string
  listing_type: string
  worker_type: string | null
  // Organization fields
  organization_name: string | null
  position: string | null
  skills: string | null
  field: string | null
  experience: string | null
  salary: string | null
  address: string | null
  // Individual fields
  job_description: string | null
  wage: string | null
  // Common fields
  additional_info: string | null
  phone: string
  email: string
  created_at: string
}

export default function WorkersPage() {
  const [listings, setListings] = useState<WorkerListing[]>([])
  const [myListings, setMyListings] = useState<WorkerListing[]>([])
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

      const { data: allListings } = await supabase
        .from("job_seeker_listings")
        .select("*")
        .eq("listing_type", "worker")
        .order("created_at", { ascending: false })

      const { data: userListings } = await supabase
        .from("job_seeker_listings")
        .select("*")
        .eq("user_id", user.id)
        .eq("listing_type", "worker")
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

  const OrganizationCard = ({ listing, showDelete = false }: { listing: WorkerListing; showDelete?: boolean }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                <Building2 className="h-3 w-3 mr-1" />
                Байгууллага
              </Badge>
            </div>
            
            <h3 className="font-semibold text-lg text-foreground">
              {listing.organization_name}
            </h3>
            
            {listing.position && (
              <p className="text-sm font-medium text-primary mt-1">
                <Briefcase className="h-3 w-3 inline mr-1" />
                {listing.position}
              </p>
            )}
            
            {listing.field && (
              <p className="text-sm text-muted-foreground mt-1">Чиглэл: {listing.field}</p>
            )}
            
            {listing.skills && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                Чадвар: {listing.skills}
              </p>
            )}
            
            {listing.experience && (
              <p className="text-sm text-muted-foreground mt-1">Туршлага: {listing.experience}</p>
            )}
            
            <div className="flex flex-wrap gap-3 mt-3 text-sm">
              {listing.salary && (
                <span className="flex items-center gap-1 text-green-600">
                  <Banknote className="h-4 w-4" />
                  {listing.salary}
                </span>
              )}
              {listing.address && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {listing.address}
                </span>
              )}
            </div>

            {listing.additional_info && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {listing.additional_info}
              </p>
            )}
            
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground border-t pt-3">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {listing.phone}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {listing.email}
              </span>
            </div>
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

  const IndividualCard = ({ listing, showDelete = false }: { listing: WorkerListing; showDelete?: boolean }) => (
    <Card 
      className="mb-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => !showDelete && router.push(`/workers/${listing.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                <User className="h-3 w-3 mr-1" />
                Хувь хүн
              </Badge>
            </div>
            
            <h3 className="font-semibold text-foreground">
              {listing.job_description}
            </h3>
            
            {listing.wage && (
              <p className="text-sm font-medium text-green-600 mt-2">
                <Banknote className="h-4 w-4 inline mr-1" />
                {listing.wage}
              </p>
            )}

            {listing.additional_info && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {listing.additional_info}
              </p>
            )}
            
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground border-t pt-3">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {listing.phone}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {listing.email}
              </span>
            </div>
          </div>

          {showDelete && (
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/workers/${listing.id}/applications`)
                }}
              >
                <Users className="h-4 w-4 mr-1" />
                Хүсэлтүүд
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteId(listing.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const ListingCard = ({ listing, showDelete = false }: { listing: WorkerListing; showDelete?: boolean }) => {
    if (listing.worker_type === "organization") {
      return <OrganizationCard listing={listing} showDelete={showDelete} />
    }
    if (listing.worker_type === "individual") {
      return <IndividualCard listing={listing} showDelete={showDelete} />
    }
    // Fallback for old listings without worker_type
    return <IndividualCard listing={listing} showDelete={showDelete} />
  }

  if (loading) {
    return (
      <MobileShell title="Ажилчин хайх" showBack>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </MobileShell>
    )
  }

  return (
    <MobileShell title="Ажилчин хайх" showBack>
      <div className="p-4">
        <div className="flex justify-end mb-4">
          <Button onClick={() => router.push("/workers/create")}>
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
                <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
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
                <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Та зар оруулаагүй байна</p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => router.push("/workers/create")}
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
              Та энэ зарыг устгахдаа итгэлтэй байна у|у? Энэ үйлдлийг буцаах боломжгүй.
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
