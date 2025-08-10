"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, ArrowLeft, Search, Printer, Plus, Check } from "lucide-react"
import Link from "next/link"
import { getCurrentUser, canEdit } from "@/lib/auth"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DailyGrades() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("7A") // Updated default value
  const [selectedSubject, setSelectedSubject] = useState("Matematika") // Updated default value
  const [categories, setCategories] = useState([
    { id: 1, name: "Ulangan 1", active: true },
    { id: 2, name: "Ulangan 2", active: true },
    { id: 3, name: "Ulangan 3", active: false },
    { id: 4, name: "Ulangan 4", active: false },
    { id: 5, name: "Ulangan 5", active: false },
  ])

  const students = [
    {
      id: 1,
      name: "Ahmad Rizki",
      class: "7A",
      grades: { 1: 85, 2: 88, 3: null, 4: null, 5: null },
      average: 86.5,
    },
    {
      id: 2,
      name: "Siti Nurhaliza",
      class: "7A",
      grades: { 1: 92, 2: 90, 3: null, 4: null, 5: null },
      average: 91,
    },
    {
      id: 3,
      name: "Budi Santoso",
      class: "7A",
      grades: { 1: 78, 2: 82, 3: null, 4: null, 5: null },
      average: 80,
    },
  ]

  const subjects = [
    "Matematika",
    "Bahasa Indonesia",
    "Bahasa Inggris",
    "IPA",
    "IPS",
    "PKn",
    "Agama",
    "Seni Budaya",
    "PJOK",
    "Prakarya",
    "TIK",
    "Bahasa Daerah",
  ]

  const classes = ["7A", "7B", "7C", "8A", "8B", "8C", "9A", "9B", "9C"]

  const toggleCategory = (categoryId: number) => {
    setCategories((prev) => prev.map((cat) => (cat.id === categoryId ? { ...cat, active: !cat.active } : cat)))
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = !selectedClass || student.class === selectedClass
    return matchesSearch && matchesClass
  })

  const handlePrint = () => {
    window.print()
  }

  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    setUser(currentUser)
  }, [router])

  const getFilteredStudents = () => {
    if (user?.userType === "siswa") {
      return students.filter((student) => student.name === "Ahmad Rizki")
    } else if (user?.userType === "orangtua") {
      return students.filter((student) => student.name === "Ahmad Rizki")
    }
    return filteredStudents
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <GraduationCap className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold">Nilai Ulangan Harian</h1>
                <p className="text-blue-100 text-sm">Kelola nilai ulangan harian per mata pelajaran</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        {(user?.userType === "guru" || user?.userType === "admin") && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-end mb-6">
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Cari nama siswa"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500">
                      <SelectValue placeholder="Semua Kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7A">Semua Kelas</SelectItem>
                      {classes.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          Kelas {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-48">
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500">
                      <SelectValue placeholder="Semua Mata Pelajaran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Matematika">Semua Mata Pelajaran</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handlePrint}
                  className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>

              {/* Category Selection */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Kategori Ulangan:</h3>
                <div className="flex flex-wrap gap-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={category.active}
                        onCheckedChange={() => toggleCategory(category.id)}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <label htmlFor={`category-${category.id}`} className="text-sm font-medium cursor-pointer">
                        {category.name}
                      </label>
                      {category.active && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 ml-2">
                          <Check className="h-3 w-3 mr-1" />
                          Aktif
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grades Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Daftar Nilai Ulangan Harian</CardTitle>
              {canEdit(user?.userType) && (
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Nilai
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>Kelas</TableHead>
                    {categories
                      .filter((cat) => cat.active)
                      .map((category) => (
                        <TableHead key={category.id}>{category.name}</TableHead>
                      ))}
                    <TableHead>Rata-rata</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredStudents().map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      {categories
                        .filter((cat) => cat.active)
                        .map((category) => (
                          <TableCell key={category.id}>
                            {student.grades[category.id] ? (
                              <span
                                className={`px-2 py-1 rounded text-sm ${
                                  student.grades[category.id]! >= 85
                                    ? "bg-green-100 text-green-800"
                                    : student.grades[category.id]! >= 75
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {student.grades[category.id]}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                        ))}
                      <TableCell className="font-semibold">{student.average ? student.average : "-"}</TableCell>
                      <TableCell>
                        {canEdit(user?.userType) ? (
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
