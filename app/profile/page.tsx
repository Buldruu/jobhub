import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileContent } from "@/components/profile-content"

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Get ratings for this user
  const { data: ratings } = await supabase
    .from("ratings")
    .select(`
      *,
      rater:rater_id (
        full_name,
        avatar_url
      )
    `)
    .eq("rated_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get completed jobs for this user
  const { data: completedJobs } = await supabase
    .from("completed_jobs")
    .select("*")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })

  // Get stats
  let stats = { jobsPosted: 0, applicationsReceived: 0, jobsApplied: 0, jobsCompleted: 0 }
  
  if (profile?.user_type === "employer") {
    const { count: jobsCount } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("employer_id", user.id)
    
    const { count: appsCount } = await supabase
      .from("applications")
      .select("*, jobs!inner(employer_id)", { count: "exact", head: true })
      .eq("jobs.employer_id", user.id)
    
    stats.jobsPosted = jobsCount || 0
    stats.applicationsReceived = appsCount || 0
  } else {
    const { count: appliedCount } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("worker_id", user.id)
    
    stats.jobsCompleted = completedJobs?.length || 0
    stats.jobsApplied = appliedCount || 0
  }

  return (
    <ProfileContent 
      user={user}
      profile={profile}
      ratings={ratings || []}
      stats={stats}
      completedJobs={completedJobs || []}
    />
  )
}
