import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SearchContent } from "@/components/search-content"
import { Suspense } from "react"
import Loading from "./loading"

export default async function SearchPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const { data: jobs } = await supabase
    .from("jobs")
    .select(`
      *,
      profiles:employer_id (
        full_name,
        avatar_url,
        average_rating
      )
    `)
    .eq("status", "open")
    .order("created_at", { ascending: false })

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  return (
    <Suspense fallback={<Loading />}>
      <SearchContent 
        jobs={jobs || []}
        categories={categories || []}
      />
    </Suspense>
  )
}
