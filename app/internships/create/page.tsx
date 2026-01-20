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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2 } from "lucide-react"

export default function CreateInternshipListingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [hasSalary, setHasSalary] = useState<"yes" | "no">("no")
  const [formData, setFormData] = useState({
    organizationName: "",
    field: "",
    salary: "",
    phone: "",
    email: "",
    additionalInfo: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.organizationName || !formData.field || !formData.phone || !formData.email) {
      alert("Бүх талбарыг бөглөнө үү")
      return
    }

    setLoading(true)

    const { error } = await supabase.from("job_seeker_listings").insert({
      user_id: user.id,
      organization_name: formData.organizationName,
      field: formData.field,
      salary: hasSalary === "yes" ? formData.salary : "Цалингүй",
      phone: formData.phone,
      email: formData.email,
      additional_info: formData.additionalInfo || null,
      listing_type: "internship",
      worker_type: "organization",
    })

    if (error) {
      alert("Зар оруулахад алдаа гарлаа")
      setLoading(false)
      return
    }

    router.push("/internships")
  }

  return (
    <MobileShell title="Зар нэмэх" showBack>
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Дадлагын зар</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organizationName">Байгууллагын нэр *</Label>
                <Input
                  id="organizationName"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  placeholder="Байгууллагын нэр"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="field">Чиглэл *</Label>
                <Input
                  id="field"
                  value={formData.field}
                  onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                  placeholder="Жишээ: Програм хангамж, Маркетинг, Санхүү"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Цалин *</Label>
                <RadioGroup
                  value={hasSalary}
                  onValueChange={(value: "yes" | "no") => setHasSalary(value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="salary-yes" />
                    <Label htmlFor="salary-yes" className="font-normal cursor-pointer">Цалинтай</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="salary-no" />
                    <Label htmlFor="salary-no" className="font-normal cursor-pointer">Цалингүй</Label>
                  </div>
                </RadioGroup>

                {hasSalary === "yes" && (
                  <div className="space-y-2">
                    <Label htmlFor="salary">Цалингийн дүн</Label>
                    <Input
                      id="salary"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      placeholder="Жишээ: 500,000₮ - 800,000₮"
                    />
                  </div>
                )}
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

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Нэмэлт мэдээлэл</Label>
                <Textarea
                  id="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                  placeholder="Дадлагын хугацаа, шаардлага, бусад мэдээлэл..."
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
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
