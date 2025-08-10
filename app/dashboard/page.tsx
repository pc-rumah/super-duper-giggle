"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  GraduationCap,
  BookOpen,
  Users,
  FileText,
  Calendar,
  LogOut,
  BarChart3,
  CheckSquare,
  UserCog,
  Target,
} from "lucide-react"
import Link from "next/link"
import { getCurrentUser, logout, canEdit } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { UserInfo } from "@/components/user-info"
import { ParentChecklist } from "@/components/parent-checklist"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSubjects: 0,
    totalClasses: 0,
  })

  useEffect(() => {
    const initializeUser = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/")
        return
      }
      setUser(currentUser)
      await loadStats()
    }
    
    initializeUser()
  }, [router])

  const loadStats = async () => {
    try {
      const [studentsResult, subjectsResult] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('subjects').select('id', { count: 'exact' })
      ])

      setStats({
        totalStudents: studentsResult.count || 0,
        totalSubjects: subjectsResult.count || 0,
        totalClasses: 15, // Static for now
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const getMenuItems = () => {
    const baseItems = [
      {
        title: "Nilai UTS & UAS",
        description:
          user?.userType === "siswa" || user?.userType === "orangtua"
            ? "Lihat nilai Ujian Tengah Semester dan Ujian Akhir Semester"
            : "Kelola nilai Ujian Tengah Semester dan Ujian Akhir Semester",
        icon: BookOpen,
        href: "/grades/uts-uas",
        color: "bg-blue-500",
      },
      {
        title: "Nilai Ulangan Harian",
        description:
          user?.userType === "siswa" || user?.userType === "orangtua"
            ? "Lihat nilai ulangan harian per mata pelajaran"
            : "Kelola nilai ulangan harian per mata pelajaran",
        icon: FileText,
        href: "/grades/daily",
        color: "bg-green-500",
      },
      {
        title: "Informasi Siswa",
        description: "Data siswa, absensi, dan ekstrakurikuler",
        icon: Users,
        href: "/students",
        color: "bg-purple-500",
      },
    ]

    // Add student-specific menu
    if (user?.userType === "siswa") {
      baseItems.push({
        title: "Mata Pelajaran & KKM",
        description: "Lihat daftar mata pelajaran dan nilai KKM",
        icon: Target,
        href: "/student-subjects",
        color: "bg-indigo-500",
      })
    }

    if (canEdit(user?.userType)) {
      baseItems.push({
        title: "Laporan",
        description: "Generate dan print laporan nilai",
        icon: BarChart3,
        href: "/reports",
        color: "bg-orange-500",
      })
    }

    if (user?.userType === "admin") {
      baseItems.push(
        {
          title: "Rekap Checklist Orang Tua",
          description: "Lihat rekap checklist dari orang tua siswa",
          icon: CheckSquare,
          href: "/parent-checklist-recap",
          color: "bg-indigo-500",
        },
        {
          title: "Manajemen User",
          description: "Kelola akun pengguna sistem",
          icon: UserCog,
          href: "/user-management",
          color: "bg-red-500",
        },
      )
    }

    return baseItems
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold">Dashboard - SMP Negeri 4 Boyolali</h1>
                <p className="text-blue-100 text-sm">Sistem Informasi Akademik</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <UserInfo />
              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Selamat Datang,{" "}
              {user?.userType === "siswa"
                ? "Ahmad Rizki"
                : user?.userType === "orangtua"
                  ? "Budi Santoso (Orang Tua Ahmad Rizki)"
                  : user?.userType === "guru"
                    ? "Siti Nurhaliza, S.Pd"
                    : "Drs. H. Ahmad Suryadi, M.Pd"}
              !
            </h2>
            <p className="text-gray-600">
              {user?.userType === "siswa" && "Akses informasi nilai dan absensi Anda di sini."}
              {user?.userType === "orangtua" && "Pantau perkembangan akademik anak Anda."}
              {user?.userType === "guru" && "Kelola nilai dan data akademik siswa."}
              {user?.userType === "admin" && "Kelola seluruh sistem informasi akademik sekolah."}
            </p>
          </div>

          {/* Parent Checklist Section */}
          {user?.userType === "orangtua" && (
            <div className="mb-8">
              <ParentChecklist />
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Siswa</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Mata Pelajaran</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSubjects}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Kelas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
                  </div>
                  <GraduationCap className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Semester</p>
                    <p className="text-2xl font-bold text-gray-900">2024/2025</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Menu Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {getMenuItems().map((item, index) => (
              <Link key={index} href={item.href}>
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className={`${item.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                        <item.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription className="mt-1">{item.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
