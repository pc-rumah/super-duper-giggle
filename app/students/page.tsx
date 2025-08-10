"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { GraduationCap, ArrowLeft, Search, User, Calendar, Activity, Edit, Trash2, UserPlus } from "lucide-react"
import Link from "next/link"
import { getCurrentUser, canEdit } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface Student {
  id: number
  name: string
  class: string
  nisn: string
  email?: string
  phone?: string
  address?: string
  parentName?: string
  parentPhone?: string
  attendance: {
    present: number
    sick: number
    permission: number
    absent: number
  }
  extracurricular: string[]
}

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [user, setUser] = useState<any>(null)
  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      name: "Ahmad Rizki",
      class: "7A",
      nisn: "1234567890",
      email: "ahmad.rizki@email.com",
      phone: "081234567890",
      address: "Jl. Merdeka No. 123, Jakarta",
      parentName: "Budi Santoso",
      parentPhone: "081234567891",
      attendance: {
        present: 85,
        sick: 3,
        permission: 2,
        absent: 1,
      },
      extracurricular: ["Pramuka", "Basket", "English Club"],
    },
    {
      id: 2,
      name: "Siti Nurhaliza",
      class: "7A",
      nisn: "1234567891",
      email: "siti.nurhaliza@email.com",
      phone: "081234567892",
      address: "Jl. Sudirman No. 456, Jakarta",
      parentName: "Andi Wijaya",
      parentPhone: "081234567893",
      attendance: {
        present: 88,
        sick: 2,
        permission: 1,
        absent: 0,
      },
      extracurricular: ["Pramuka", "Paduan Suara", "Tari"],
    },
    {
      id: 3,
      name: "Budi Santoso",
      class: "7A",
      nisn: "1234567892",
      email: "budi.santoso@email.com",
      phone: "081234567894",
      address: "Jl. Thamrin No. 789, Jakarta",
      parentName: "Dewi Sartika",
      parentPhone: "081234567895",
      attendance: {
        present: 82,
        sick: 4,
        permission: 3,
        absent: 2,
      },
      extracurricular: ["Pramuka", "Sepak Bola"],
    },
  ])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    class: "",
    nisn: "",
    email: "",
    phone: "",
    address: "",
    parentName: "",
    parentPhone: "",
    extracurricular: [] as string[],
  })

  const router = useRouter()

  const classes = ["7A", "7B", "7C", "8A", "8B", "8C", "9A", "9B", "9C"]
  const availableExtracurricular = [
    "Pramuka",
    "Basket",
    "Sepak Bola",
    "Voli",
    "Badminton",
    "Tenis Meja",
    "English Club",
    "Paduan Suara",
    "Tari",
    "Teater",
    "Robotika",
    "Komputer",
    "Seni Lukis",
    "Fotografi",
    "Jurnalistik",
    "PMR",
    "Paskibra",
  ]

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    setUser(currentUser)
  }, [router])

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.nisn.includes(searchTerm)
    const matchesClass = selectedClass === "all" || student.class === selectedClass
    return matchesSearch && matchesClass
  })

  const getFilteredStudents = () => {
    if (user?.userType === "siswa") {
      return students.filter((student) => student.name === "Ahmad Rizki")
    } else if (user?.userType === "orangtua") {
      return students.filter((student) => student.name === "Ahmad Rizki")
    }
    return filteredStudents
  }

  const getAttendancePercentage = (attendance: any) => {
    const total = attendance.present + attendance.sick + attendance.permission + attendance.absent
    return total > 0 ? ((attendance.present / total) * 100).toFixed(1) : "0.0"
  }

  const resetForm = () => {
    setFormData({
      name: "",
      class: "",
      nisn: "",
      email: "",
      phone: "",
      address: "",
      parentName: "",
      parentPhone: "",
      extracurricular: [],
    })
  }

  const handleAddStudent = () => {
    if (!formData.name || !formData.class || !formData.nisn) {
      alert("Mohon lengkapi data wajib (Nama, Kelas, NISN)")
      return
    }

    const newStudent: Student = {
      id: Math.max(...students.map((s) => s.id)) + 1,
      name: formData.name,
      class: formData.class,
      nisn: formData.nisn,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      parentName: formData.parentName,
      parentPhone: formData.parentPhone,
      attendance: {
        present: 0,
        sick: 0,
        permission: 0,
        absent: 0,
      },
      extracurricular: formData.extracurricular,
    }

    setStudents([...students, newStudent])
    setIsAddDialogOpen(false)
    resetForm()
    alert("Siswa berhasil ditambahkan!")
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setFormData({
      name: student.name,
      class: student.class,
      nisn: student.nisn,
      email: student.email || "",
      phone: student.phone || "",
      address: student.address || "",
      parentName: student.parentName || "",
      parentPhone: student.parentPhone || "",
      extracurricular: student.extracurricular,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateStudent = () => {
    if (!formData.name || !formData.class || !formData.nisn) {
      alert("Mohon lengkapi data wajib (Nama, Kelas, NISN)")
      return
    }

    if (!editingStudent) return

    const updatedStudents = students.map((student) =>
      student.id === editingStudent.id
        ? {
            ...student,
            name: formData.name,
            class: formData.class,
            nisn: formData.nisn,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            parentName: formData.parentName,
            parentPhone: formData.parentPhone,
            extracurricular: formData.extracurricular,
          }
        : student,
    )

    setStudents(updatedStudents)
    setIsEditDialogOpen(false)
    setEditingStudent(null)
    resetForm()
    alert("Data siswa berhasil diperbarui!")
  }

  const handleDeleteStudent = (studentId: number) => {
    const updatedStudents = students.filter((student) => student.id !== studentId)
    setStudents(updatedStudents)
    alert("Siswa berhasil dihapus!")
  }

  const handleExtracurricularChange = (activity: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        extracurricular: [...prev.extracurricular, activity],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        extracurricular: prev.extracurricular.filter((item) => item !== activity),
      }))
    }
  }

  const StudentForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Lengkap *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Masukkan nama lengkap"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nisn">NISN *</Label>
          <Input
            id="nisn"
            value={formData.nisn}
            onChange={(e) => setFormData((prev) => ({ ...prev, nisn: e.target.value }))}
            placeholder="Masukkan NISN"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="class">Kelas *</Label>
          <Select value={formData.class} onValueChange={(value) => setFormData((prev) => ({ ...prev, class: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih kelas" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  Kelas {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="Masukkan email"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">No. Telepon</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="Masukkan no. telepon"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="parentName">Nama Orang Tua</Label>
          <Input
            id="parentName"
            value={formData.parentName}
            onChange={(e) => setFormData((prev) => ({ ...prev, parentName: e.target.value }))}
            placeholder="Masukkan nama orang tua"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="parentPhone">No. Telepon Orang Tua</Label>
        <Input
          id="parentPhone"
          value={formData.parentPhone}
          onChange={(e) => setFormData((prev) => ({ ...prev, parentPhone: e.target.value }))}
          placeholder="Masukkan no. telepon orang tua"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Alamat</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
          placeholder="Masukkan alamat lengkap"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Ekstrakurikuler</Label>
        <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
          {availableExtracurricular.map((activity) => (
            <div key={activity} className="flex items-center space-x-2">
              <Checkbox
                id={activity}
                checked={formData.extracurricular.includes(activity)}
                onCheckedChange={(checked) => handleExtracurricularChange(activity, checked as boolean)}
              />
              <Label htmlFor={activity} className="text-sm cursor-pointer">
                {activity}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

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
                <h1 className="text-xl font-bold">Informasi Siswa</h1>
                <p className="text-blue-100 text-sm">Data siswa, absensi, dan ekstrakurikuler</p>
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
                      placeholder="Cari nama siswa atau NISN"
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
                {canEdit(user?.userType) && (
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="h-10 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Tambah Siswa
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Tambah Siswa Baru</DialogTitle>
                        <DialogDescription>
                          Lengkapi form di bawah untuk menambahkan siswa baru. Field dengan tanda * wajib diisi.
                        </DialogDescription>
                      </DialogHeader>
                      <StudentForm />
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsAddDialogOpen(false)
                            resetForm()
                          }}
                        >
                          Batal
                        </Button>
                        <Button onClick={handleAddStudent} className="bg-green-600 hover:bg-green-700">
                          Tambah Siswa
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Students Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Data Siswa</span>
              <Badge variant="secondary" className="ml-2">
                {getFilteredStudents().length} siswa
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">Daftar Siswa</TabsTrigger>
                <TabsTrigger value="attendance">Absensi Detail</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="mt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>NISN</TableHead>
                        <TableHead>Nama Siswa</TableHead>
                        <TableHead>Kelas</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Kehadiran</TableHead>
                        <TableHead>Ekstrakurikuler</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredStudents().map((student, index) => (
                        <TableRow key={student.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-mono text-sm">{student.nisn}</TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.class}</TableCell>
                          <TableCell className="text-sm text-gray-600">{student.email || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {getAttendancePercentage(student.attendance)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {student.extracurricular.slice(0, 2).map((activity, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {activity}
                                </Badge>
                              ))}
                              {student.extracurricular.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{student.extracurricular.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {canEdit(user?.userType) ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditStudent(student)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Hapus Siswa</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Apakah Anda yakin ingin menghapus data siswa <strong>{student.name}</strong>?
                                          Tindakan ini tidak dapat dibatalkan.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteStudent(student.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Hapus
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </>
                              ) : (
                                <Button variant="outline" size="sm">
                                  Detail
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="attendance" className="mt-6">
                <div className="grid gap-6">
                  {getFilteredStudents().map((student) => (
                    <Card key={student.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <User className="h-5 w-5" />
                            <span>
                              {student.name} - {student.class}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">Kehadiran: {getAttendancePercentage(student.attendance)}%</Badge>
                            {canEdit(user?.userType) && (
                              <Button variant="outline" size="sm" onClick={() => handleEditStudent(student)}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            )}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Attendance Stats */}
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              Statistik Absensi
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-green-50 p-3 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{student.attendance.present}</div>
                                <div className="text-sm text-green-700">Hadir</div>
                              </div>
                              <div className="bg-yellow-50 p-3 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-600">{student.attendance.sick}</div>
                                <div className="text-sm text-yellow-700">Sakit</div>
                              </div>
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{student.attendance.permission}</div>
                                <div className="text-sm text-blue-700">Izin</div>
                              </div>
                              <div className="bg-red-50 p-3 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">{student.attendance.absent}</div>
                                <div className="text-sm text-red-700">Alfa</div>
                              </div>
                            </div>
                          </div>

                          {/* Student Info & Extracurricular */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center">
                                <User className="h-4 w-4 mr-2" />
                                Informasi Kontak
                              </h4>
                              <div className="space-y-2 text-sm">
                                <p>
                                  <strong>Email:</strong> {student.email || "-"}
                                </p>
                                <p>
                                  <strong>Telepon:</strong> {student.phone || "-"}
                                </p>
                                <p>
                                  <strong>Orang Tua:</strong> {student.parentName || "-"}
                                </p>
                                <p>
                                  <strong>Telepon Orang Tua:</strong> {student.parentPhone || "-"}
                                </p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-3 flex items-center">
                                <Activity className="h-4 w-4 mr-2" />
                                Ekstrakurikuler
                              </h4>
                              <div className="space-y-2">
                                {student.extracurricular.length > 0 ? (
                                  student.extracurricular.map((activity, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                      <span className="font-medium">{activity}</span>
                                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                        Aktif
                                      </Badge>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-gray-500 text-sm">Tidak mengikuti ekstrakurikuler</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Data Siswa</DialogTitle>
            <DialogDescription>Perbarui informasi siswa. Field dengan tanda * wajib diisi.</DialogDescription>
          </DialogHeader>
          <StudentForm isEdit={true} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setEditingStudent(null)
                resetForm()
              }}
            >
              Batal
            </Button>
            <Button onClick={handleUpdateStudent} className="bg-blue-600 hover:bg-blue-700">
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
