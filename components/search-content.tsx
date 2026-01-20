"use client"

import { useState } from "react"
import { Search, SlidersHorizontal, X, Briefcase } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MobileShell } from "@/components/mobile-shell"
import { BottomNav } from "@/components/bottom-nav"
import { JobCard } from "@/components/job-card"

interface Job {
  id: string
  title: string
  organization_name: string | null
  location: string | null
  salary_min: number | null
  salary_max: number | null
  job_type: string
  created_at: string
  category_id: string | null
  profiles?: {
    full_name: string | null
    avatar_url: string | null
    average_rating: number | null
  } | null
}

interface Category {
  id: string
  name: string
  icon: string | null
}

interface SearchContentProps {
  jobs: Job[]
  categories: Category[]
}

export function SearchContent({ jobs, categories }: SearchContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedJobType, setSelectedJobType] = useState<string>("all")
  const [location, setLocation] = useState("")

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = searchQuery === "" || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.organization_name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || job.category_id === selectedCategory
    const matchesJobType = selectedJobType === "all" || job.job_type === selectedJobType
    const matchesLocation = location === "" || 
      job.location?.toLowerCase().includes(location.toLowerCase())

    return matchesSearch && matchesCategory && matchesJobType && matchesLocation
  })

  const clearFilters = () => {
    setSelectedCategory("all")
    setSelectedJobType("all")
    setLocation("")
  }

  const hasFilters = selectedCategory !== "all" || selectedJobType !== "all" || location

  return (
    <MobileShell title="Ажил хайх">
      <div className="px-4 py-4 pb-24 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Ажлын нэр, байгууллага..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-12 w-12 shrink-0 bg-transparent">
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl">
              <SheetHeader>
                <SheetTitle>Шүүлтүүр</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Ангилал</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Бүх ангилал" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Бүх ангилал</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ажлын төрөл</Label>
                  <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Бүх төрөл" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Бүх төрөл</SelectItem>
                      <SelectItem value="full_time">Бүтэн цаг</SelectItem>
                      <SelectItem value="part_time">Хагас цаг</SelectItem>
                      <SelectItem value="contract">Гэрээт</SelectItem>
                      <SelectItem value="temporary">Түр</SelectItem>
                      <SelectItem value="daily">Өдрийн</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Байршил</Label>
                  <Input
                    placeholder="Байршил оруулах..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                {hasFilters && (
                  <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
                    <X className="h-4 w-4 mr-2" />
                    Шүүлтүүр цэвэрлэх
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters */}
        {hasFilters && (
          <div className="flex gap-2 flex-wrap">
            {selectedCategory !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {categories.find(c => c.id === selectedCategory)?.name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("all")} />
              </Badge>
            )}
            {selectedJobType !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {selectedJobType === "full_time" ? "Бүтэн цаг" : 
                 selectedJobType === "part_time" ? "Хагас цаг" :
                 selectedJobType === "contract" ? "Гэрээт" :
                 selectedJobType === "temporary" ? "Түр" : "Өдрийн"}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedJobType("all")} />
              </Badge>
            )}
            {location && (
              <Badge variant="secondary" className="gap-1">
                {location}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setLocation("")} />
              </Badge>
            )}
          </div>
        )}

        {/* Results */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{filteredJobs.length} үр дүн</span>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Таны хайлтад тохирох ажил олдсонгүй</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </MobileShell>
  )
}
