"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MobileShell } from "@/components/mobile-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, X, Loader2 } from "lucide-react"

export default function CreateTrainingListingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvUrl, setCvUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    education: "",
    experience: "",
    cvText: "",
    phone: "",
    email: "",
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
      setFormData(prev => ({ ...prev, email: user.email || "" }))
    }
    checkUser()
  }, [router, supabase.auth])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/pdf"
    ]
    
    if (!allowedTypes.includes(file.type)) {
      alert("Зөвхөн Word эсвэл PDF файл оруулна уу")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Файлын хэмжээ 5MB-с ихгүй байх ёстой")
      return
    }

    setCvFile(file)
    setUploading(true)

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("cvs")
        .upload(filePath, file)

      if (uploadError) {
        alert("Файл оруулахад алдаа гарлаа")
        setCvFile(null)
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from("cvs")
          .getPublicUrl(filePath)
        setCvUrl(publicUrl)
      }
    } catch (error) {
      alert("Файл оруулахад алдаа гарлаа")
      setCvFile(null)
    } finally {
      setUploading(false)
    }
  }

  const removeCv = async () => {
    if (cvUrl && user) {
      const path = cvUrl.split("/cvs/")[1]
      if (path) {
        await supabase.storage.from("cvs").remove([path])
      }
    }
    setCvFile(null)
    setCvUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.lastName || !formData.firstName || !formData.phone || !formData.email) {
      alert("Бүх талбарыг бөглөнө үү")
      return
    }

    setLoading(true)

    const { error } = await supabase.from("job_seeker_listings").insert({
      user_id: user.id,
      last_name: formData.lastName,
      first_name: formData.firstName,
      education: formData.education,
      experience: formData.experience,
      cv_url: cvUrl,
      cv_text: formData.cvText || null,
      phone: formData.phone,
      email: formData.email,
      listing_type: "training",
    })

    if (error) {
      alert("Зар оруулахад алдаа гарлаа")
      setLoading(false)
      return
    }

    router.push("/training")
  }

  return (
    <MobileShell title="Зар нэмэх" showBack>
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Сургалт хайж байна</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName">Овог *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Овог"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">Нэр *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Нэр"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Боловсрол</Label>
                <Input
                  id="education"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  placeholder="Жишээ: Бакалавр, Мэдээллийн технологи"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Туршлага</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="Өмнөх ажлын туршлага, ур чадварууд..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>CV</Label>
                <p className="text-xs text-muted-foreground">Файл оруулах эсвэл гараар бичнэ үү</p>
                
                {/* File Upload Option */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Файлаар оруулах (Word эсвэл PDF)</p>
                  {cvFile ? (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="flex-1 text-sm truncate">{cvFile.name}</span>
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Button type="button" variant="ghost" size="icon" onClick={removeCv}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        type="file"
                        accept=".doc,.docx,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="cv-upload"
                      />
                      <Label
                        htmlFor="cv-upload"
                        className="flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      >
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">CV файл сонгох</span>
                      </Label>
                    </div>
                  )}
                </div>

                {/* Manual Text Entry Option */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Гараар бичих</p>
                  <Textarea
                    id="cvText"
                    value={formData.cvText}
                    onChange={(e) => setFormData({ ...formData, cvText: e.target.value })}
                    placeholder="CV-ийн мэдээлэл:&#10;&#10;- Боловсрол&#10;- Ажлын туршлага&#10;- Ур чадвар&#10;- Гадаад хэлний мэдлэг&#10;- Бусад мэдээлэл..."
                    rows={8}
                    className="resize-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Холбоо барих утас *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="99001122"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email хаяг *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading || uploading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Хадгалж байна...
                  </>
                ) : (
                  "Зар оруулах"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MobileShell>
  )
}
