"use client"

import Link from "next/link"
import { MapPin, Clock, Star, Building2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface JobCardProps {
  job: {
    id: string
    title: string
    organization_name: string | null
    location: string | null
    salary_min: number | null
    salary_max: number | null
    job_type: string
    created_at: string
    profiles?: {
      full_name: string | null
      avatar_url: string | null
      average_rating: number | null
    } | null
  }
}

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "Тохиролцоно"
  if (min && max) return `${min.toLocaleString()}₮ - ${max.toLocaleString()}₮`
  if (min) return `${min.toLocaleString()}₮-с дээш`
  return `${max?.toLocaleString()}₮ хүртэл`
}

function formatJobType(type: string): string {
  const types: Record<string, string> = {
    full_time: "Бүтэн цаг",
    part_time: "Хагас цаг",
    contract: "Гэрээт",
    temporary: "Түр",
    daily: "Өдрийн",
  }
  return types[type] || type
}

function getTimeAgo(date: string): string {
  const now = new Date()
  const created = new Date(date)
  const diffMs = now.getTime() - created.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins} минутын өмнө`
  if (diffHours < 24) return `${diffHours} цагийн өмнө`
  if (diffDays < 7) return `${diffDays} өдрийн өмнө`
  return created.toLocaleDateString("mn-MN")
}

export function JobCard({ job }: JobCardProps) {
  const rating = job.profiles?.average_rating

  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="hover:shadow-md transition-shadow bg-card">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{job.title}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {job.organization_name || "Хувь хүн"}
              </p>
              
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location}
                  </span>
                )}
                {rating !== null && rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    {rating.toFixed(1)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="font-semibold text-primary">
                  {formatSalary(job.salary_min, job.salary_max)}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {formatJobType(job.job_type)}
                </Badge>
              </div>

              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {getTimeAgo(job.created_at)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
