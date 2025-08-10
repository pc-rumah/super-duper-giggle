"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, GraduationCap, Users, BookOpen, Award, User, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { authenticateUser } from "@/lib/auth"

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const slides = [
    {
      image: "/placeholder.svg?height=400&width=800",
      title: "SMP Negeri 4 Boyolali",
      description: "Sekolah Menengah Pertama Negeri 4 Boyolali - Membangun Generasi Cerdas dan Berkarakter",
    },
    {
      image: "/placeholder.svg?height=400&width=800",
      title: "Pendidikan Berkualitas",
      description: "Memberikan pendidikan terbaik dengan fasilitas modern dan tenaga pengajar profesional",
    },
    {
      image: "/placeholder.svg?height=400&width=800",
      title: "Teknologi Pembelajaran",
      description: "Mengintegrasikan teknologi dalam proses pembelajaran untuk masa depan yang lebih baik",
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const userTypes = [
    { value: "siswa", label: "Siswa", icon: "👨‍🎓" },
    { value: "orangtua", label: "Orang Tua", icon: "👨‍👩‍👧‍👦" },
    { value: "guru", label: "Guru", icon: "👨‍🏫" },
    { value: "admin", label: "Admin", icon: "👨‍💼" },
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password || !userType) {
      alert("Mohon lengkapi semua field")
      return
    }

    setIsLoading(true)

    try {
      const user = authenticateUser(username, password, userType)

      if (user) {
        localStorage.setItem("user", JSON.stringify(user))
        router.push("/dashboard")
      } else {
        alert("Username, password, atau tipe user tidak valid")
      }
    } catch (error) {
      alert("Terjadi kesalahan saat login")
    } finally {
      setIsLoading(false)
    }
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
                <h1 className="text-xl font-bold">SMP Negeri 4 Boyolali</h1>
                <p className="text-blue-100 text-sm">Sistem Informasi Akademik</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Image Slider */}
      <section className="relative">
        <div className="relative h-96 overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                index === currentSlide ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <img src={slide.image || "/placeholder.svg"} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <h2 className="text-4xl font-bold mb-4">{slide.title}</h2>
                  <p className="text-xl max-w-2xl">{slide.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? "bg-white" : "bg-white bg-opacity-50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Login Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-md">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center bg-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-center space-x-2">
                <User className="h-6 w-6" />
                <span>Login Sistem</span>
              </CardTitle>
              <CardDescription className="text-blue-100">Masuk ke Sistem Informasi Akademik</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tipe User</label>
                  <Select value={userType} onValueChange={setUserType}>
                    <SelectTrigger className="border-gray-300 focus:border-blue-500">
                      <SelectValue placeholder="Pilih tipe user" />
                    </SelectTrigger>
                    <SelectContent>
                      {userTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            <span>{type.icon}</span>
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Masukkan username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-500"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-500"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading ? "Memproses..." : "Masuk"}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Button
                  onClick={() => router.push("/login-demo")}
                  variant="outline"
                  className="w-full text-blue-600 border-blue-600 hover:bg-blue-50"
                  disabled={isLoading}
                >
                  Coba Akun Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Information Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Tentang Sistem Informasi Akademik</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sistem informasi akademik yang terintegrasi untuk memudahkan pengelolaan data akademik siswa, nilai,
              absensi, dan informasi sekolah lainnya.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Manajemen Nilai</h3>
                <p className="text-gray-600 text-sm">
                  Kelola nilai UTS, UAS, dan ulangan harian dengan mudah dan terorganisir
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Data Siswa</h3>
                <p className="text-gray-600 text-sm">
                  Informasi lengkap siswa termasuk absensi dan kegiatan ekstrakurikuler
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Laporan</h3>
                <p className="text-gray-600 text-sm">
                  Generate laporan nilai dan absensi dengan fitur print yang mudah digunakan
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Akademik</h3>
                <p className="text-gray-600 text-sm">Sistem terintegrasi untuk semua kebutuhan akademik sekolah</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-600 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <GraduationCap className="h-6 w-6" />
            <span className="font-semibold">SMP Negeri 4 Boyolali</span>
          </div>
          <p className="text-blue-100">© 2025 SMP Negeri 4 Boyolali. Sistem Informasi Akademik.</p>
        </div>
      </footer>
    </div>
  )
}
