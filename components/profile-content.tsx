"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  User, 
  Star, 
  Briefcase, 
  MapPin, 
  Phone, 
  Settings, 
  LogOut, 
  Edit2,
  Loader2,
  CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MobileShell } from "@/components/mobile-shell"
import { BottomNav } from "@/components/bottom-nav"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface Profile {
  id: string
  full_name: string | null
  user_type: string
  avatar_url: string | null
  phone: string | null
  location: string | null
  bio: string | null
  skills: string[] | null
  average_rating: number | null
  total_ratings: number | null
}

interface Rating {
  id: string
  rating: number
  comment: string | null
  created_at: string
  rater: {
    full_name: string | null
    avatar_url: string | null
  } | null
}

interface Stats {
  jobsPosted: number
  applicationsReceived: number
  jobsApplied: number
  jobsCompleted: number
}

interface CompletedJob {
  id: string
  user_id: string
  job_title: string
  employer_name: string
  rating: number | null
  completed_at: string
}

interface ProfileContentProps {
  user: SupabaseUser
  profile: Profile | null
  ratings: Rating[]
  stats: Stats
  completedJobs: CompletedJob[]
}

export function ProfileContent({ user, profile, ratings, stats, completedJobs }: ProfileContentProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    location: profile?.location || "",
    bio: profile?.bio || "",
    user_type: profile?.user_type || "worker",
    skills: profile?.skills?.join(", ") || "",
  })

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const handleUpdate = async () => {
    setLoading(true)
    
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        phone: formData.phone || null,
        location: formData.location || null,
        bio: formData.bio || null,
        user_type: formData.user_type,
        skills: formData.skills ? formData.skills.split(",").map(s => s.trim()).filter(Boolean) : null,
      })
      .eq("id", user.id)

    setLoading(false)
    
    if (!error) {
      setIsEditing(false)
      router.refresh()
    }
  }

  const isEmployer = profile?.user_type === "employer"

  return (
    <MobileShell 
      title="Профайл"
      rightAction={
        <Sheet open={isEditing} onOpenChange={setIsEditing}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Edit2 className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Профайл засах</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Нэр</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Таны нэр"
                />
              </div>

              <div className="space-y-2">
                <Label>Хэрэглэгчийн төрөл</Label>
                <Select 
                  value={formData.user_type} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, user_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="worker">Ажилтан</SelectItem>
                    <SelectItem value="employer">Ажил олгогч</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Утас</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="99001122"
                />
              </div>

              <div className="space-y-2">
                <Label>Байршил</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Улаанбаатар"
                />
              </div>

              <div className="space-y-2">
                <Label>Товч танилцуулга</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Өөрийнхөө тухай товчхон бичнэ үү..."
                  rows={3}
                />
              </div>

              {formData.user_type === "worker" && (
                <div className="space-y-2">
                  <Label>Ур чадварууд (таслалаар тусгаарлана)</Label>
                  <Input
                    value={formData.skills}
                    onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                    placeholder="Барилга, Цахилгаан, Сантехник"
                  />
                </div>
              )}

              <Button onClick={handleUpdate} className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Хадгалж байна...
                  </>
                ) : (
                  "Хадгалах"
                )}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      }
    >
      <div className="p-4 pb-24 space-y-4">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url || "/placeholder.svg"} 
                    alt={profile.full_name || "Profile"} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">
                  {profile?.full_name || "Хэрэглэгч"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isEmployer ? "Ажил олгогч" : "Ажилтан"}
                </p>
                {profile?.average_rating !== null && profile.average_rating > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{profile.average_rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({profile.total_ratings} үнэлгээ)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-4 space-y-2">
              {profile?.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </div>
              )}
              {profile?.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {profile.phone}
                </div>
              )}
            </div>

            {/* Bio */}
            {profile?.bio && (
              <p className="mt-4 text-sm text-foreground">{profile.bio}</p>
            )}

            {/* Skills */}
            {profile?.skills && profile.skills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {isEmployer ? (
            <>
              <Card>
                <CardContent className="p-4 text-center">
                  <Briefcase className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.jobsPosted}</div>
                  <div className="text-sm text-muted-foreground">Нийтэлсэн зар</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <User className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.applicationsReceived}</div>
                  <div className="text-sm text-muted-foreground">Өргөдөл хүлээн авсан</div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-4 text-center">
                  <Briefcase className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.jobsApplied}</div>
                  <div className="text-sm text-muted-foreground">Өргөдөл илгээсэн</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-accent mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.jobsCompleted}</div>
                  <div className="text-sm text-muted-foreground">Дуусгасан ажил</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Completed Jobs */}
        {completedJobs.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Хийсэн ажил
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
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < job.rating! ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
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

        {/* Recent Ratings */}
        {ratings.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Сүүлийн үнэлгээнүүд</h3>
              <div className="space-y-3">
                {ratings.map((rating) => (
                  <div key={rating.id} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {rating.rater?.full_name || "Хэрэглэгч"}
                        </span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3 w-3 ${i < rating.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} 
                            />
                          ))}
                        </div>
                      </div>
                      {rating.comment && (
                        <p className="text-sm text-muted-foreground mt-1">{rating.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardContent className="p-2">
            <Button variant="ghost" className="w-full justify-start gap-3 h-12">
              <Settings className="h-5 w-5" />
              Тохиргоо
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Гарах
            </Button>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </MobileShell>
  )
}
