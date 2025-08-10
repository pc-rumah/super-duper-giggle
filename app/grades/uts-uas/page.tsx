"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GraduationCap, ArrowLeft, Search, Printer, Plus } from "lucide-react"
import Link from "next/link"
import { getCurrentUser, canEdit } from "@/lib/auth"
import { useRouter } from "next/navigation"

export default function UTSUASGrades() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  const students = [
    { id: 1, name: "Ahmad Rizki", class: "7A", uts: 85, uas: 88, average: 86.5 },
    { id: 2, name: "Siti Nurhaliza", class: "7A", uts: 92, uas: 90, average: 91 },
    { id: 3, name: "Budi Santoso", class: "7A", uts: 78, uas: 82, average: 80 },
    { id: 4, name: "Dewi Sartika", class: "7B", uts: 88, uas: 85, average: 86.5 },
    { id: 5, name: "Andi Wijaya", class: "7B", uts: 75, uas: 79, average: 77 },
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

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = selectedClass === "all" || student.class === selectedClass
    return matchesSearch && matchesClass
  })

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
      // Show only current student's data
      return students.filter((student) => student.name === "Ahmad Rizki")
    } else if (user?.userType === "orangtua") {
      // Show only their child's data
      return students.filter((student) => student.name === "Ahmad Rizki")
    }
    // Guru and admin can see all
    return filteredStudents
  }

  const handlePrint = () => {
    window.print()
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
                <h1 className="text-xl font-bold">Nilai UTS & UAS</h1>
                <p className="text-blue-100 text-sm">Kelola nilai Ujian Tengah & Akhir Semester</p>
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
              <div className="flex flex-col sm:flex-row gap-4 items-end">
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
                      <SelectItem value="all">Semua Kelas</SelectItem>
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
                      <SelectItem value="all">Semua Mata Pelajaran</SelectItem>
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
            </CardContent>
          </Card>
        )}

        {/* Grades Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Daftar Nilai UTS & UAS</CardTitle>
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
                    <TableHead>Nilai UTS</TableHead>
                    <TableHead>Nilai UAS</TableHead>
                    <TableHead>Rata-rata</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredStudents().map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            student.uts >= 85
                              ? "bg-green-100 text-green-800"
                              : student.uts >= 75
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {student.uts}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            student.uas >= 85
                              ? "bg-green-100 text-green-800"
                              : student.uas >= 75
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {student.uas}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">{student.average}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-sm font-medium ${
                            student.average >= 85
                              ? "bg-green-100 text-green-800"
                              : student.average >= 75
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {student.average >= 85 ? "A" : student.average >= 75 ? "B" : "C"}
                        </span>
                      </TableCell>
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
