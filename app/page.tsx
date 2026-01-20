"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MobileShell } from "@/components/mobile-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Briefcase, Users, GraduationCap, BookOpen, User, Wallet } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const menuItems = [
  {
    id: "jobs",
    title: "Ажил хайх",
    description: "Ажлын зарууд үзэх",
    icon: Briefcase,
    href: "/jobs",
    color: "bg-blue-500",
  },
  {
    id: "workers",
    title: "Ажилчин хайх",
    description: "Ажилчдын зарууд үзэх",
    icon: Users,
    href: "/workers",
    color: "bg-emerald-500",
  },
  {
    id: "internships",
    title: "Дадлага",
    description: "Дадлагын зарууд үзэх",
    icon: GraduationCap,
    href: "/internships",
    color: "bg-amber-500",
  },
  {
    id: "training",
    title: "Сургалтууд",
    description: "Сургалтын зарууд үзэх",
    icon: BookOpen,
    href: "/training",
    color: "bg-purple-500",
  },
]

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          router.push("/auth/login")
          return
        }
        setUser(user)
        
        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        
        setProfile(profileData)
        setLoading(false)
      } catch (err) {
        console.error("Auth error:", err)
        router.push("/auth/login")
      }
    }
    checkUser()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <MobileShell title="Ажил">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </MobileShell>
    )
  }

  const userAvatar = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 focus:outline-none">
          <Avatar className="h-9 w-9 border-2 border-primary/20">
            <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-foreground">{profile?.full_name || "Хэрэглэгч"}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/wallet")}>
          <Wallet className="mr-2 h-4 w-4" />
          Түрийвч
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/user/${user?.id}`)}>
          <User className="mr-2 h-4 w-4" />
          Миний хувийн мэдээлэл
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <User className="mr-2 h-4 w-4" />
          Профайл засах
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          Гарах
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <MobileShell title="Ажил" rightAction={userAvatar}>
      <div className="p-4 space-y-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Тавтай морил!</h1>
          <p className="text-muted-foreground mt-1">Та юу хайж байна вэ?</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-lg transition-shadow active:scale-95"
              onClick={() => router.push(item.href)}
            >
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className={`${item.color} p-3 rounded-full mb-3`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MobileShell>
  )
}
