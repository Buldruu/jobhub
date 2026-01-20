import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MyJobsContent } from "@/components/my-jobs-content"

export default async function MyJobsPage() {
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

  // Get jobs posted by employer OR applications by worker
  let postedJobs = null
  let appliedJobs = null

  if (profile?.user_type === "employer") {
    const { data } = await supabase
      .from("jobs")
      .select(`
        *,
        applications:applications(count)
      `)
      .eq("employer_id", user.id)
      .order("created_at", { ascending: false })
    postedJobs = data
  } else {
    const { data } = await supabase
      .from("applications")
      .select(`
        *,
        jobs:job_id (
          *,
          profiles:employer_id (
            full_name,
            avatar_url
          )
        )
      `)
      .eq("worker_id", user.id)
      .order("created_at", { ascending: false })
    appliedJobs = data
  }

  return (
    <MyJobsContent 
      profile={profile}
      postedJobs={postedJobs}
      appliedJobs={appliedJobs}
    />
  )
}
