"use client"

import Link from "next/link"
import { Briefcase, Plus, Clock, CheckCircle, XCircle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MobileShell } from "@/components/mobile-shell"
import { BottomNav } from "@/components/bottom-nav"

interface Profile {
  id: string
  full_name: string | null
  user_type: string
}

interface PostedJob {
  id: string
  title: string
  status: string
  created_at: string
  applications: { count: number }[]
}

interface AppliedJob {
  id: string
  status: string
  created_at: string
  jobs: {
    id: string
    title: string
    organization_name: string | null
    profiles: {
      full_name: string | null
      avatar_url: string | null
    } | null
  }
}

interface MyJobsContentProps {
  profile: Profile | null
  postedJobs: PostedJob[] | null
  appliedJobs: AppliedJob[] | null
}

function getStatusBadge(status: string) {
  switch (status) {
    case "open":
      return <Badge variant="default">Нээлттэй</Badge>
    case "closed":
      return <Badge variant="secondary">Хаагдсан</Badge>
    case "pending":
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Хүлээгдэж буй</Badge>
    case "accepted":
      return <Badge variant="default" className="bg-green-500">Зөвшөөрсөн</Badge>
    case "rejected":
      return <Badge variant="destructive">Татгалзсан</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "pending":
      return <Clock className="h-5 w-5 text-yellow-500" />
    case "accepted":
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case "rejected":
      return <XCircle className="h-5 w-5 text-destructive" />
    default:
      return <Briefcase className="h-5 w-5 text-muted-foreground" />
  }
}

export function MyJobsContent({ profile, postedJobs, appliedJobs }: MyJobsContentProps) {
  const isEmployer = profile?.user_type === "employer"

  return (
    <MobileShell title={isEmployer ? "Миний зарууд" : "Миний өргөдлүүд"}>
      <div className="p-4 pb-24 space-y-4">
        {isEmployer ? (
          <>
            <Link href="/post-job">
              <Button className="w-full h-12 gap-2">
                <Plus className="h-5 w-5" />
                Шинэ ажлын зар нийтлэх
              </Button>
            </Link>

            {!postedJobs || postedJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Та одоогоор ажлын зар нийтлээгүй байна</p>
              </div>
            ) : (
              <div className="space-y-3">
                {postedJobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">{job.title}</h3>
                            <div className="flex items-center gap-2 mt-2">
                              {getStatusBadge(job.status)}
                              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                {job.applications?.[0]?.count || 0} өргөдөл
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {!appliedJobs || appliedJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Та одоогоор ямар ч ажилд өргөдөл гаргаагүй байна</p>
                <Link href="/search">
                  <Button className="mt-4">Ажил хайх</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {appliedJobs.map((application) => (
                  <Link key={application.id} href={`/jobs/${application.jobs.id}`}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                            {getStatusIcon(application.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                              {application.jobs.title}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {application.jobs.organization_name || application.jobs.profiles?.full_name || "Хувь хүн"}
                            </p>
                            <div className="mt-2">
                              {getStatusBadge(application.status)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </MobileShell>
  )
}
