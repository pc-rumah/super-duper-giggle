"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { GraduationCap, ArrowLeft, Search, Printer, Plus, Check } from "lucide-react"
import Link from "next/link"
import { getCurrentUser, canEdit } from "@/lib/auth"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface DailyGrade {
  id: string
  student_id: string
  student_name: string
  student_class: string
  subject_id: string
  subject_name: string
  category_name: string
  score?: number
}

export default function DailyGrades() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [user, setUser] = useState<any>(null)
  const [grades, setGrades] = useState<DailyGrade[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    student_id: "",
    subject_id: "",
    category_name: "",
    score: "",
  })
  const router = useRouter()

  const [categories, setCategories] = useState([
    { id: 1, name: "Ulangan 1", active: true },
    { id: 2, name: "Ulangan 2", active: true },
    { id: 3, name: "Ulangan 3", active: false },
    { id: 4, name: "Ulangan 4", active: false },
    { id: 5, name: "Ulangan 5", active: false },
  ])

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

      // Load daily grades
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades_daily')
        .select(`
          *,
          students!inner(id, name, class),
          subjects!inner(id, name)
        `)
        .order('students(name)')

      if (gradesError) throw gradesError

      const formattedGrades: DailyGrade[] = (gradesData || []).map((grade: any) => ({
        id: grade.id,
        student_id: grade.student_id,
        student_name: grade.students.name,
        student_class: grade.students.class,
        subject_id: grade.subject_id,
        subject_name: grade.subjects.name,
        category_name: grade.category_name,
        score: grade.score,
      }))

      setGrades(formattedGrades)

      // Extract unique classes
      const uniqueClasses = [...new Set(formattedGrades.map(g => g.student_class))].sort()
      setClasses(uniqueClasses)

    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const toggleCategory = (categoryId: number) => {
    setCategories((prev) => prev.map((cat) => (cat.id === categoryId ? { ...cat, active: !cat.active } : cat)))
  }

  const filteredGrades = grades.filter((grade) => {
    const matchesSearch = grade.student_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = selectedClass === "all" || grade.student_class === selectedClass
    const matchesSubject = selectedSubject === "all" || grade.subject_id === selectedSubject
    return matchesSearch && matchesClass && matchesSubject
  })

  const getFilteredGrades = () => {
    if (user?.userType === "siswa") {
      return filteredGrades.filter((grade) => grade.student_name === user.name)
    } else if (user?.userType === "orangtua") {
      return filteredGrades.filter((grade) => grade.student_name === user.name)
    }
    return filteredGrades
  }

  const handleAddGrade = async () => {
    if (!formData.student_id || !formData.subject_id || !formData.category_name) {
      alert("Mohon lengkapi semua field yang diperlukan")
      return
    }

    try {
      const { error } = await supabase
        .from('grades_daily')
        .upsert({
          student_id: formData.student_id,
          subject_id: formData.subject_id,
          category_name: formData.category_name,
          score: formData.score ? parseInt(formData.score) : null,
        }, {
          onConflict: 'student_id,subject_id,category_name'
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
      category_name: "",
      score: "",
    })
  }

  const handlePrint = () => {
    window.print()
  }

  // Group grades by student for display
  const groupedGrades = getFilteredGrades().reduce((acc, grade) => {
    const key = `${grade.student_id}-${grade.subject_id}`
    if (!acc[key]) {
      acc[key] = {
        student_id: grade.student_id,
        student_name: grade.student_name,
        student_class: grade.student_class,
        subject_id: grade.subject_id,
        subject_name: grade.subject_name,
        grades: {},
        average: 0
      }
    }
    acc[key].grades[grade.category_name] = grade.score
    return acc
  }, {} as any)

  // Calculate averages
  Object.values(groupedGrades).forEach((student: any) => {
    const scores = Object.values(student.grades).filter(score => score !== null && score !== undefined) as number[]
    student.average = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
  })

  const displayStudents = Object.values(groupedGrades)

  const getGradeForCategory = (studentGrades: any, categoryName: string) => {
    return studentGrades[categoryName] || null
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
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Nilai
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Nilai Ulangan Harian</DialogTitle>
                      <DialogDescription>
                        Masukkan nilai ulangan harian untuk siswa
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Kategori Ulangan</Label>
                        <Select value={formData.category_name} onValueChange={(value) => setFormData(prev => ({ ...prev, category_name: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.filter(cat => cat.active).map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
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
                      <div className="space-y-2">
                        <Label htmlFor="score">Nilai</Label>
                        <Input
                          id="score"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.score}
                          onChange={(e) => setFormData(prev => ({ ...prev, score: e.target.value }))}
                          placeholder="0-100"
                        />
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
                  {displayStudents.map((student: any, index) => (
                    <TableRow key={`${student.student_id}-${student.subject_id}`}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{student.student_name}</TableCell>
                      <TableCell>{student.student_class}</TableCell>
                      <TableCell>{student.subject_name}</TableCell>
                      {categories
                        .filter((cat) => cat.active)
                        .map((category) => (
                          <TableCell key={category.id}>
                            {getGradeForCategory(student.grades, category.name) ? (
                              <span
                                className={`px-2 py-1 rounded text-sm ${
                                  getGradeForCategory(student.grades, category.name)! >= 85
                                    ? "bg-green-100 text-green-800"
                                    : getGradeForCategory(student.grades, category.name)! >= 75
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {getGradeForCategory(student.grades, category.name)}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                        ))}
                      <TableCell className="font-semibold">{student.average ? student.average.toFixed(1) : "-"}</TableCell>
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
