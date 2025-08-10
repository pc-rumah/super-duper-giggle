"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { GraduationCap, ArrowLeft, Search, Printer, Plus } from "lucide-react"
import Link from "next/link"
import { getCurrentUser, canEdit } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface StudentGrade {
  id: string
  student_id: string
  student_name: string
  student_class: string
  subject_id: string
  subject_name: string
  uts_score?: number
  uas_score?: number
  average?: number
}

export default function UTSUASGrades() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [user, setUser] = useState<any>(null)
  const [students, setStudents] = useState<StudentGrade[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingGrade, setEditingGrade] = useState<StudentGrade | null>(null)
  const [formData, setFormData] = useState({
    student_id: "",
    subject_id: "",
    uts_score: "",
    uas_score: "",
  })
  const router = useRouter()

  useEffect(() => {
    const initializePage = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/")
        return
      }
      setUser(currentUser)
      await loadData()
    }
    
    initializePage()
  }, [router])

  const loadData = async () => {
    try {
      // Load subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('name')

      if (subjectsError) throw subjectsError
      setSubjects(subjectsData || [])

      // Load students with grades
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades_uts_uas')
        .select(`
          *,
          students!inner(id, name, class),
          subjects!inner(id, name)
        `)
        .order('students(name)')

      if (gradesError) throw gradesError

      const formattedGrades: StudentGrade[] = (gradesData || []).map((grade: any) => ({
        id: grade.id,
        student_id: grade.student_id,
        student_name: grade.students.name,
        student_class: grade.students.class,
        subject_id: grade.subject_id,
        subject_name: grade.subjects.name,
        uts_score: grade.uts_score,
        uas_score: grade.uas_score,
        average: grade.uts_score && grade.uas_score ? 
          ((grade.uts_score + grade.uas_score) / 2) : undefined
      }))

      setStudents(formattedGrades)

      // Extract unique classes
      const uniqueClasses = [...new Set(formattedGrades.map(g => g.student_class))].sort()
      setClasses(uniqueClasses)

    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.student_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = selectedClass === "all" || student.student_class === selectedClass
    const matchesSubject = selectedSubject === "all" || student.subject_id === selectedSubject
    return matchesSearch && matchesClass && matchesSubject
  })

  const getFilteredStudents = () => {
    if (user?.userType === "siswa") {
      return filteredStudents.filter((student) => student.student_name === user.name)
    } else if (user?.userType === "orangtua") {
      return filteredStudents.filter((student) => student.student_name === user.name)
    }
    return filteredStudents
  }

  const handleAddGrade = async () => {
    if (!formData.student_id || !formData.subject_id) {
      alert("Mohon pilih siswa dan mata pelajaran")
      return
    }

    try {
      const { error } = await supabase
        .from('grades_uts_uas')
        .upsert({
          student_id: formData.student_id,
          subject_id: formData.subject_id,
          uts_score: formData.uts_score ? parseInt(formData.uts_score) : null,
          uas_score: formData.uas_score ? parseInt(formData.uas_score) : null,
        }, {
          onConflict: 'student_id,subject_id'
        })

      if (error) throw error

      await loadData()
      setIsAddDialogOpen(false)
      resetForm()
      alert("Nilai berhasil disimpan!")
    } catch (error) {
      console.error('Error saving grade:', error)
      alert("Gagal menyimpan nilai")
    }
  }

  const resetForm = () => {
    setFormData({
      student_id: "",
      subject_id: "",
      uts_score: "",
      uas_score: "",
    })
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
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
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
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Nilai
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Nilai UTS & UAS</DialogTitle>
                      <DialogDescription>
                        Masukkan nilai UTS dan UAS untuk siswa
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="student">Siswa</Label>
                        <Select value={formData.student_id} onValueChange={(value) => setFormData(prev => ({ ...prev, student_id: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih siswa" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Load students from database */}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Mata Pelajaran</Label>
                        <Select value={formData.subject_id} onValueChange={(value) => setFormData(prev => ({ ...prev, subject_id: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih mata pelajaran" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="uts">Nilai UTS</Label>
                          <Input
                            id="uts"
                            type="number"
                            min="0"
                            max="100"
                            value={formData.uts_score}
                            onChange={(e) => setFormData(prev => ({ ...prev, uts_score: e.target.value }))}
                            placeholder="0-100"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="uas">Nilai UAS</Label>
                          <Input
                            id="uas"
                            type="number"
                            min="0"
                            max="100"
                            value={formData.uas_score}
                            onChange={(e) => setFormData(prev => ({ ...prev, uas_score: e.target.value }))}
                            placeholder="0-100"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                        Batal
                      </Button>
                      <Button onClick={handleAddGrade} className="bg-green-600 hover:bg-green-700">
                        Simpan
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
                    <TableHead>Mata Pelajaran</TableHead>
                    <TableHead>Nilai UTS</TableHead>
                    <TableHead>Nilai UAS</TableHead>
                    <TableHead>Rata-rata</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredStudents().map((student, index) => (
                    <TableRow key={`${student.student_id}-${student.subject_id}`}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{student.student_name}</TableCell>
                      <TableCell>{student.student_class}</TableCell>
                      <TableCell>{student.subject_name}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            (student.uts_score || 0) >= 85
                              ? "bg-green-100 text-green-800"
                              : (student.uts_score || 0) >= 75
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {student.uts_score || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            (student.uas_score || 0) >= 85
                              ? "bg-green-100 text-green-800"
                              : (student.uas_score || 0) >= 75
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {student.uas_score || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">{student.average?.toFixed(1) || "-"}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-sm font-medium ${
                            (student.average || 0) >= 85
                              ? "bg-green-100 text-green-800"
                              : (student.average || 0) >= 75
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {(student.average || 0) >= 85 ? "A" : (student.average || 0) >= 75 ? "B" : "C"}
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
