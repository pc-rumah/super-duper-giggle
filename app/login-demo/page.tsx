"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, User, Users, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginDemo() {
  const router = useRouter()

  const demoAccounts = [
    {
      type: "siswa",
      username: "siswa123",
      password: "siswa123",
      name: "Ahmad Rizki",
      description: "Dapat melihat nilai dan absensi sendiri",
      icon: GraduationCap,
      color: "bg-blue-500",
    },
    {
      type: "orangtua",
      username: "orangtua123",
      password: "orangtua123",
      name: "Budi Santoso (Orang Tua)",
      description: "Dapat melihat nilai dan absensi anak",
      icon: Users,
      color: "bg-green-500",
    },
    {
      type: "guru",
      username: "guru123",
      password: "guru123",
      name: "Siti Nurhaliza, S.Pd",
      description: "Dapat melihat dan mengubah semua data siswa",
      icon: User,
      color: "bg-purple-500",
    },
    {
      type: "admin",
      username: "admin123",
      password: "admin123",
      name: "Drs. H. Ahmad Suryadi, M.Pd",
      description: "Akses penuh ke seluruh sistem",
      icon: Shield,
      color: "bg-red-500",
    },
  ]

  const handleDemoLogin = (account: any) => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        username: account.username,
        userType: account.type,
        loginTime: new Date().toISOString(),
      }),
    )
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold">Demo Login - SMP Negeri 4 Boyolali</h1>
                <p className="text-blue-100 text-sm">Pilih akun demo untuk mencoba sistem</p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
            >
              Kembali ke Login
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Akun Demo</h2>
          <p className="text-gray-600">Pilih salah satu akun di bawah untuk mencoba sistem dengan role yang berbeda</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {demoAccounts.map((account, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div
                  className={`${account.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <account.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-lg">{account.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600 text-sm">{account.description}</p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p>
                    <strong>Username:</strong> {account.username}
                  </p>
                  <p>
                    <strong>Password:</strong> {account.password}
                  </p>
                </div>
                <Button
                  onClick={() => handleDemoLogin(account)}
                  className="w-full"
                  style={{ backgroundColor: account.color.replace("bg-", "").replace("-500", "") }}
                >
                  Login sebagai {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Perbedaan Akses:</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>
              <strong>Siswa & Orang Tua:</strong> Hanya dapat melihat data (read-only)
            </li>
            <li>
              <strong>Guru & Admin:</strong> Dapat melihat dan mengubah semua data
            </li>
            <li>
              <strong>Siswa:</strong> Hanya melihat data diri sendiri
            </li>
            <li>
              <strong>Orang Tua:</strong> Hanya melihat data anak
            </li>
            <li>
              <strong>Guru:</strong> Melihat semua siswa, dapat edit nilai
            </li>
            <li>
              <strong>Admin:</strong> Akses penuh ke seluruh sistem
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
