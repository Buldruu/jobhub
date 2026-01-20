"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MobileShell } from "@/components/mobile-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase,
  GraduationCap,
  Calendar,
  FileText,
  Download,
  ExternalLink
} from "lucide-react"

interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  location: string | null
  bio: string | null
  user_type: string
  created_at: string
}

interface CompletedJob {
  id: string
  job_title: string
  employer_name: string
  rating: number | null
  completed_at: string
}

interface Listing {
  id: string
  first_name: string
  last_name: string
  education: string | null
  experience: string | null
  cv_url: string | null
  cv_text: string | null
  phone: string | null
  email: string | null
  listing_type: string
  poster_type: string | null
  job_description: string | null
  wage: number | null
  additional_info: string | null
  created_at: string
}

interface IndividualJobApplication {
  id: string
  listing_id: string
  worker_id: string
  status: string
  worker_rating: number | null
  worker_comment: string | null
  poster_rating: number | null
  poster_comment: string | null
  created_at: string
  completed_at: string | null
  listing?: Listing
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [individualJobs, setIndividualJobs] = useState<Listing[]>([])
  const [jobApplications, setJobApplications] = useState<IndividualJobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [ratedJobs, setRatedJobs] = useState<CompletedJob[]>([])

  useEffect(() => {
    const fetchData = async () => {
      // Check if viewing own profile
      const { data: { user } } = await supabase.auth.getUser()
      setIsOwnProfile(user?.id === userId)

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      // Fetch completed jobs
      const { data: jobsData } = await supabase
        .from("completed_jobs")
        .select("*")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false })

      if (jobsData) {
        setCompletedJobs(jobsData)
        const ratedJobsData = jobsData.filter(job => job.rating !== null)
        setRatedJobs(ratedJobsData)
      }

      // Fetch user's listings
      const { data: listingsData } = await supabase
        .from("job_seeker_listings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (listingsData) {
        setListings(listingsData)
        // Filter individual job posts
        const individualJobPosts = listingsData.filter(
          (l: Listing) => l.listing_type === "worker" && l.poster_type === "individual"
        )
        setIndividualJobs(individualJobPosts)
      }

      // Fetch job applications for this user's individual job posts (ratings from workers)
      const { data: applicationsData } = await supabase
        .from("individual_job_applications")
        .select("*")
        .eq("poster_id", userId)
        .eq("status", "completed")
        .not("worker_rating", "is", null)
      
      if (applicationsData) {
        setJobApplications(applicationsData)
      }

      setLoading(false)
    }

    fetchData()
  }, [userId, supabase])

  // Calculate average rating from individual job applications (ratings given by workers)
  const ratedApplications = jobApplications.filter(app => app.worker_rating !== null)
  const averageRating = ratedApplications.length > 0 
    ? ratedApplications.reduce((acc, app) => acc + (app.worker_rating || 0), 0) / ratedApplications.length 
    : 0
  const totalCompletedJobs = jobApplications.length

  if (loading) {
    return (
      <MobileShell title="Хувийн мэдээлэл" showBack>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </MobileShell>
    )
  }

  if (!profile) {
    return (
      <MobileShell title="Хувийн мэдээлэл" showBack>
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <p>Хэрэглэгч олдсонгүй</p>
          <Button variant="link" onClick={() => router.back()}>
            Буцах
          </Button>
        </div>
      </MobileShell>
    )
  }

  return (
    <MobileShell title="Хувийн мэдээлэл" showBack>
      <div className="p-4 space-y-4">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={profile.avatar_url || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {profile.full_name?.charAt(0) || profile.email?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              
              <h1 className="mt-4 text-xl font-bold text-foreground">
                {profile.full_name || "Нэргүй хэрэглэгч"}
              </h1>
              
              <Badge variant="secondary" className="mt-2">
                {profile.user_type === "employer" ? "Ажил олгогч" : "Ажил хайгч"}
              </Badge>

              {/* Average Rating */}
              {ratedApplications.length > 0 && (
                <div className="flex items-center gap-1 mt-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(averageRating) 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-muted"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({averageRating.toFixed(1)}) - {ratedApplications.length} үнэлгээ, {totalCompletedJobs} ажил хийсэн
                  </span>
                </div>
              )}

              {profile.bio && (
                <p className="mt-3 text-sm text-muted-foreground">{profile.bio}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-foreground">Холбоо барих</h3>
            
            {profile.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{profile.email}</span>
              </div>
            )}
            
            {profile.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{profile.phone}</span>
              </div>
            )}
            
            {profile.location && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{profile.location}</span>
              </div>
            )}
            
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Бүртгүүлсэн: {new Date(profile.created_at).toLocaleDateString("mn-MN")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Individual Job Posts (Хувь хүний ажил) */}
        {individualJobs.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Хувь хүний ажлын зарууд ({individualJobs.length})
              </h3>
              <div className="space-y-3">
                {individualJobs.map((job) => (
                  <div key={job.id} className="border border-border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{job.job_description || "Ажил"}</h4>
                        {job.wage && (
                          <p className="text-sm text-primary font-medium mt-1">
                            {new Intl.NumberFormat("mn-MN").format(job.wage)}₮
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary">Хувь хүн</Badge>
                    </div>
                    {job.additional_info && (
                      <p className="text-sm text-muted-foreground mt-2">{job.additional_info}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {job.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {job.phone}
                        </span>
                      )}
                      {job.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {job.email}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* User's Listings */}
        {listings.filter(l => !(l.listing_type === "worker" && l.poster_type === "individual")).length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Зарууд ({listings.length})
              </h3>
              <div className="space-y-3">
                {listings.map((listing) => (
                  <div key={listing.id} className="border border-border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-foreground">
                          {listing.last_name} {listing.first_name}
                        </h4>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {listing.listing_type === "job" && "Ажил хайж байна"}
                          {listing.listing_type === "worker" && "Ажилчин"}
                          {listing.listing_type === "internship" && "Дадлага"}
                          {listing.listing_type === "training" && "Сургалт"}
                        </Badge>
                      </div>
                    </div>
                    
                    {listing.education && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <GraduationCap className="h-4 w-4" />
                        {listing.education}
                      </div>
                    )}
                    
                    {listing.experience && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        {listing.experience}
                      </div>
                    )}

                    {listing.cv_text && (
                      <div className="mt-2 p-2 bg-muted rounded text-sm text-muted-foreground whitespace-pre-wrap">
                        {listing.cv_text.length > 200 
                          ? `${listing.cv_text.substring(0, 200)}...` 
                          : listing.cv_text}
                      </div>
                    )}

                    {listing.cv_url && (
                      <a 
                        href={listing.cv_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 mt-2 text-sm text-primary hover:underline"
                      >
                        <Download className="h-4 w-4" />
                        CV татах
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {listing.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {listing.phone}
                        </span>
                      )}
                      {listing.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {listing.email}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed Jobs */}
        {completedJobs.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Хийсэн ажлууд ({completedJobs.length})
              </h3>
              <div className="space-y-3">
                {completedJobs.map((job) => (
                  <div key={job.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-foreground">{job.job_title}</h4>
                        <p className="text-sm text-muted-foreground">{job.employer_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(job.completed_at).toLocaleDateString("mn-MN")}
                        </p>
                      </div>
                      {job.rating !== null && (
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < job.rating! 
                                  ? "fill-yellow-400 text-yellow-400" 
                                  : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Profile Button (only for own profile) */}
        {isOwnProfile && (
          <Button 
            className="w-full" 
            onClick={() => router.push("/profile")}
          >
            Профайл засах
          </Button>
        )}
      </div>
    </MobileShell>
  )
}
