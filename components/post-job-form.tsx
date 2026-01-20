"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MobileShell } from "@/components/mobile-shell"
import { BottomNav } from "@/components/bottom-nav"
import { createClient } from "@/lib/supabase/client"

interface Profile {
  id: string
  full_name: string | null
  user_type: string
}

interface Category {
  id: string
  name: string
}

interface PostJobFormProps {
  userId: string
  profile: Profile | null
  categories: Category[]
}

export function PostJobForm({ userId, profile, categories }: PostJobFormProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    organization_name: "",
    location: "",
    salary_min: "",
    salary_max: "",
    job_type: "full_time",
    category_id: "",
    duration: "",
    requirements: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error: insertError } = await supabase
      .from("jobs")
      .insert({
        employer_id: userId,
        title: formData.title,
        description: formData.description,
        organization_name: formData.organization_name || null,
        location: formData.location || null,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        job_type: formData.job_type,
        category_id: formData.category_id || null,
        duration: formData.duration || null,
        requirements: formData.requirements || null,
        status: "open",
      })

    if (insertError) {
      setError("Ажлын зар нийтлэхэд алдаа гарлаа")
      setLoading(false)
      return
    }

    router.push("/my-jobs")
    router.refresh()
  }

  if (profile?.user_type === "worker") {
    return (
      <MobileShell title="Ажлын зар нийтлэх" showBack>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <p className="text-muted-foreground">
            Зөвхөн ажил олгогчид ажлын зар нийтлэх боломжтой. 
            Та профайл хэсгээс төрлөө солих боломжтой.
          </p>
          <Button className="mt-4" onClick={() => router.push("/profile")}>
            Профайл руу очих
          </Button>
        </div>
        <BottomNav />
      </MobileShell>
    )
  }

  return (
    <MobileShell title="Ажлын зар нийтлэх" showBack>
      <form onSubmit={handleSubmit} className="p-4 pb-24 space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">Ажлын нэр *</Label>
          <Input
            id="title"
            placeholder="Жишээ: Барилгын ажилтан"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="organization_name">Байгууллагын нэр</Label>
          <Input
            id="organization_name"
            placeholder="Байгууллагын нэр (заавал биш)"
            value={formData.organization_name}
            onChange={(e) => handleChange("organization_name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Тайлбар *</Label>
          <Textarea
            id="description"
            placeholder="Ажлын дэлгэрэнгүй тайлбар..."
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            required
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Ангилал</Label>
          <Select value={formData.category_id} onValueChange={(v) => handleChange("category_id", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Ангилал сонгох" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="job_type">Ажлын төрөл *</Label>
          <Select value={formData.job_type} onValueChange={(v) => handleChange("job_type", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_time">Бүтэн цаг</SelectItem>
              <SelectItem value="part_time">Хагас цаг</SelectItem>
              <SelectItem value="contract">Гэрээт</SelectItem>
              <SelectItem value="temporary">Түр</SelectItem>
              <SelectItem value="daily">Өдрийн</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Байршил</Label>
          <Input
            id="location"
            placeholder="Жишээ: Улаанбаатар, БЗД"
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="salary_min">Доод цалин (₮)</Label>
            <Input
              id="salary_min"
              type="number"
              placeholder="500000"
              value={formData.salary_min}
              onChange={(e) => handleChange("salary_min", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary_max">Дээд цалин (₮)</Label>
            <Input
              id="salary_max"
              type="number"
              placeholder="1000000"
              value={formData.salary_max}
              onChange={(e) => handleChange("salary_max", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Хугацаа</Label>
          <Input
            id="duration"
            placeholder="Жишээ: 3 сар, 1 жил"
            value={formData.duration}
            onChange={(e) => handleChange("duration", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="requirements">Шаардлага</Label>
          <Textarea
            id="requirements"
            placeholder="Ажилтанд тавигдах шаардлага..."
            value={formData.requirements}
            onChange={(e) => handleChange("requirements", e.target.value)}
            rows={3}
          />
        </div>

        <Button type="submit" className="w-full h-12" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Нийтэлж байна...
            </>
          ) : (
            "Ажлын зар нийтлэх"
          )}
        </Button>
      </form>
      <BottomNav />
    </MobileShell>
  )
}
