import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PostJobForm } from "@/components/post-job-form"

export default async function PostJobPage() {
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

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  return (
    <PostJobForm 
      userId={user.id}
      profile={profile}
      categories={categories || []}
    />
  )
}
