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
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Building2, User } from "lucide-react"

type ListingType = "organization" | "individual" | null

export default function CreateWorkerListingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [listingType, setListingType] = useState<ListingType>(null)
  const router = useRouter()
  const supabase = createClient()

  // Organization form data
  const [orgFormData, setOrgFormData] = useState({
    organizationName: "",
    position: "",
    skills: "",
    field: "",
    experience: "",
    salary: "",
    address: "",
    phone: "",
    email: "",
    additionalInfo: "",
  })

  // Individual form data
  const [indFormData, setIndFormData] = useState({
    jobDescription: "",
    wage: "",
    additionalInfo: "",
    phone: "",
    email: "",
  })

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          router.push("/auth/login")
          return
        }
        setUser(user)
        setOrgFormData(prev => ({ ...prev, email: user.email || "" }))
        setIndFormData(prev => ({ ...prev, email: user.email || "" }))
        setLoading(false)
      } catch (err) {
        console.error("Auth error:", err)
        router.push("/auth/login")
      }
    }
    checkUser()
  }, [router, supabase])

  const handleSubmitOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)

    const { error } = await supabase.from("job_seeker_listings").insert({
      user_id: user.id,
      listing_type: "worker",
      worker_type: "organization",
      organization_name: orgFormData.organizationName,
      position: orgFormData.position,
      skills: orgFormData.skills,
      field: orgFormData.field,
      experience: orgFormData.experience,
      salary: orgFormData.salary,
      address: orgFormData.address,
      phone: orgFormData.phone,
      email: orgFormData.email,
      additional_info: orgFormData.additionalInfo,
    })

    setSubmitting(false)

    if (error) {
      console.error("Error creating listing:", error)
      alert("Алдаа гарлаа. Дахин оролдоно уу.")
      return
    }

    router.push("/workers")
  }

  const handleSubmitIndividual = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)

    const { error } = await supabase.from("job_seeker_listings").insert({
      user_id: user.id,
      listing_type: "worker",
      worker_type: "individual",
      job_description: indFormData.jobDescription,
      wage: indFormData.wage,
      additional_info: indFormData.additionalInfo,
      phone: indFormData.phone,
      email: indFormData.email,
    })

    setSubmitting(false)

    if (error) {
      console.error("Error creating listing:", error)
      alert("Алдаа гарлаа. Дахин оролдоно уу.")
      return
    }

    router.push("/workers")
  }

  if (loading) {
    return (
      <MobileShell title="Зар нэмэх" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileShell>
    )
  }

  // Type selection screen
  if (!listingType) {
    return (
      <MobileShell title="Зар нэмэх" showBack>
        <div className="p-4 space-y-4">
          <p className="text-center text-muted-foreground mb-6">
            Зарын төрлөө сонгоно уу
          </p>
          
          <Card 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => setListingType("organization")}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">Байгууллага</h3>
                <p className="text-sm text-muted-foreground">
                  Компани, байгууллагын нэрийн өмнөөс ажилтан хайх
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => setListingType("individual")}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-accent/20 flex items-center justify-center">
                <User className="h-7 w-7 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">Хувь хүн</h3>
                <p className="text-sm text-muted-foreground">
                  Хувийн ажил хийлгэх хүн хайх
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MobileShell>
    )
  }

  // Organization form
  if (listingType === "organization") {
    return (
      <MobileShell title="Байгууллага - Зар нэмэх" showBack>
        <div className="p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setListingType(null)}
            className="mb-4"
          >
            ← Төрөл солих
          </Button>

          <form onSubmit={handleSubmitOrganization} className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Байгууллагын нэр *</Label>
                  <Input
                    id="organizationName"
                    value={orgFormData.organizationName}
                    onChange={(e) => setOrgFormData({ ...orgFormData, organizationName: e.target.value })}
                    placeholder="Байгууллагын нэрийг оруулна уу"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Албан тушаал *</Label>
                  <Input
                    id="position"
                    value={orgFormData.position}
                    onChange={(e) => setOrgFormData({ ...orgFormData, position: e.target.value })}
                    placeholder="Жишээ: Менежер, Инженер"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Чадвар</Label>
                  <Textarea
                    id="skills"
                    value={orgFormData.skills}
                    onChange={(e) => setOrgFormData({ ...orgFormData, skills: e.target.value })}
                    placeholder="Шаардлагатай чадварууд"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="field">Чиглэл</Label>
                  <Input
                    id="field"
                    value={orgFormData.field}
                    onChange={(e) => setOrgFormData({ ...orgFormData, field: e.target.value })}
                    placeholder="Жишээ: IT, Санхүү, Маркетинг"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Туршлага</Label>
                  <Input
                    id="experience"
                    value={orgFormData.experience}
                    onChange={(e) => setOrgFormData({ ...orgFormData, experience: e.target.value })}
                    placeholder="Жишээ: 2+ жил"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Цалин</Label>
                  <Input
                    id="salary"
                    value={orgFormData.salary}
                    onChange={(e) => setOrgFormData({ ...orgFormData, salary: e.target.value })}
                    placeholder="Жишээ: 1,500,000 - 2,000,000₮"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Хаяг</Label>
                  <Input
                    id="address"
                    value={orgFormData.address}
                    onChange={(e) => setOrgFormData({ ...orgFormData, address: e.target.value })}
                    placeholder="Байршлын хаяг"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Холбоо барих утас *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={orgFormData.phone}
                    onChange={(e) => setOrgFormData({ ...orgFormData, phone: e.target.value })}
                    placeholder="99112233"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email хаяг *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={orgFormData.email}
                    onChange={(e) => setOrgFormData({ ...orgFormData, email: e.target.value })}
                    placeholder="info@company.mn"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Нэмэлт мэдээлэл</Label>
                  <Textarea
                    id="additionalInfo"
                    value={orgFormData.additionalInfo}
                    onChange={(e) => setOrgFormData({ ...orgFormData, additionalInfo: e.target.value })}
                    placeholder="Бусад мэдээлэл..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Илгээж байна...
                </>
              ) : (
                "Зар нийтлэх"
              )}
            </Button>
          </form>
        </div>
      </MobileShell>
    )
  }

  // Individual form
  return (
    <MobileShell title="Хувь хүн - Зар нэмэх" showBack>
      <div className="p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setListingType(null)}
          className="mb-4"
        >
          ← Төрөл солих
        </Button>

        <form onSubmit={handleSubmitIndividual} className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jobDescription">Хийлгэх ажил *</Label>
                <Textarea
                  id="jobDescription"
                  value={indFormData.jobDescription}
                  onChange={(e) => setIndFormData({ ...indFormData, jobDescription: e.target.value })}
                  placeholder="Ямар ажил хийлгэхийг тодорхойлно уу"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wage">Ажлын хөлс</Label>
                <Input
                  id="wage"
                  value={indFormData.wage}
                  onChange={(e) => setIndFormData({ ...indFormData, wage: e.target.value })}
                  placeholder="Жишээ: 50,000₮ / өдөр"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="indAdditionalInfo">Нэмэлт мэдээлэл</Label>
                <Textarea
                  id="indAdditionalInfo"
                  value={indFormData.additionalInfo}
                  onChange={(e) => setIndFormData({ ...indFormData, additionalInfo: e.target.value })}
                  placeholder="Бусад мэдээлэл..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="indPhone">Холбоо барих утас *</Label>
                <Input
                  id="indPhone"
                  type="tel"
                  value={indFormData.phone}
                  onChange={(e) => setIndFormData({ ...indFormData, phone: e.target.value })}
                  placeholder="99112233"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="indEmail">Email хаяг *</Label>
                <Input
                  id="indEmail"
                  type="email"
                  value={indFormData.email}
                  onChange={(e) => setIndFormData({ ...indFormData, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Илгээж байна...
              </>
            ) : (
              "Зар нийтлэх"
            )}
          </Button>
        </form>
      </div>
    </MobileShell>
  )
}
