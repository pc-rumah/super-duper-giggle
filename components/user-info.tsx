"use client"

import { useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { User, GraduationCap, Users, Shield } from "lucide-react"

export function UserInfo() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    loadUser()
  }, [])

  if (!user) return null

  const getUserIcon = () => {
    switch (user.userType) {
      case "siswa":
        return <GraduationCap className="h-4 w-4" />
      case "orangtua":
        return <Users className="h-4 w-4" />
      case "guru":
        return <User className="h-4 w-4" />
      case "admin":
        return <Shield className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getUserLabel = () => {
    switch (user.userType) {
      case "siswa":
        return "Siswa"
      case "orangtua":
        return "Orang Tua"
      case "guru":
        return "Guru"
      case "admin":
        return "Admin"
      default:
        return "User"
    }
  }

  const getBadgeColor = () => {
    switch (user.userType) {
      case "siswa":
        return "bg-blue-100 text-blue-800"
      case "orangtua":
        return "bg-green-100 text-green-800"
      case "guru":
        return "bg-purple-100 text-purple-800"
      case "admin":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Badge className={`${getBadgeColor()} flex items-center space-x-1`}>
      {getUserIcon()}
      <span>{getUserLabel()}</span>
    </Badge>
  )
}
