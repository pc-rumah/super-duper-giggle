"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, ArrowLeft, BookOpen, Target, TrendingUp } from "lucide-react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface Subject {
  id: number
  name: string
  code: string
  kkm: number
  teacher: string
  semester: string
  credits: number
  category: "wajib" | "pilihan"
}

interface StudentGrade {
  subjectId: number
  utsScore?: number
  uasScore?: number
  dailyScores: number[]
  finalScore?: number
  grade?: string
  status: "lulus" | "tidak_lulus" | "belum_dinilai"
}

export default function StudentSubjects() {
  const [user, setUser] = useState<any>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [grades, setGrades] = useState<StudentGrade[]>([])
  const router = useRouter()

  const subjectData: Subject[] = [
    {
      id: 1,
      name: "Matematika",
      code: "MTK",
      kkm: 75,
      teacher: "Siti Nurhaliza, S.Pd",
      semester: "Ganjil 2024/2025",
      credits: 4,
      category: "wajib",
    },
    {
      id: 2,
      name: "Bahasa Indonesia",
      code: "BIN",
      kkm: 70,
      teacher: "Ahmad Suryadi, S.Pd",
      semester: "Ganjil 2024/2025",
      credits: 4,
      category: "wajib",
    },
    {
      id: 3,
      name: "Bahasa Inggris",
      code: "BIG",
      kkm: 70,
      teacher: "Maria Sari, S.Pd",
      semester: "Ganjil 2024/2025",
      credits: 3,
      category: "wajib",
    },
    {
      id: 4,
      name: "IPA (Ilmu Pengetahuan Alam)",
      code: "IPA",
      kkm: 75,
      teacher: "Dr. Budi Hartono, M.Pd",
      semester: "Ganjil 2024/2025",
      credits: 4,
      category: "wajib",
    },
    {
      id: 5,
      name: "IPS (Ilmu Pengetahuan Sosial)",
      code: "IPS",
      kkm: 70,
      teacher: "Dewi Kartika, S.Pd",
      semester: "Ganjil 2024/2025",
      credits: 3,
      category: "wajib",
    },
    {
      id: 6,
      name: "Pendidikan Kewarganegaraan",
      code: "PKN",
      kkm: 75,
      teacher: "Andi Wijaya, S.Pd",
      semester: "Ganjil 2024/2025",
      credits: 2,
      category: "wajib",
    },
    {
      id: 7,
      name: "Pendidikan Agama Islam",
      code: "PAI",
      kkm: 75,
      teacher: "H. Muhammad Ali, S.Ag",
      semester: "Ganjil 2024/2025",
      credits: 2,
      category: "wajib",
    },
    {
      id: 8,
      name: "Seni Budaya",
      code: "SBK",
      kkm: 70,
      teacher: "Sari Indah, S.Pd",
      semester: "Ganjil 2024/2025",
      credits: 2,
      category: "wajib",
    },
    {
      id: 9,
      name: "Pendidikan Jasmani",
      code: "PJOK",
      kkm: 75,
      teacher: "Rudi Santoso, S.Pd",
      semester: "Ganjil 2024/2025",
      credits: 2,
      category: "wajib",
    },
    {
      id: 10,
      name: "Prakarya",
      code: "PKY",
      kkm: 70,
      teacher: "Lina Marlina, S.Pd",
      semester: "Ganjil 2024/2025",
      credits: 2,
      category: "wajib",
    },
    {
      id: 11,
      name: "Teknologi Informasi",
      code: "TIK",
      kkm: 75,
      teacher: "Agus Setiawan, S.Kom",
      semester: "Ganjil 2024/2025",
      credits: 2,
      category: "pilihan",
    },
    {
      id: 12,
      name: "Bahasa Daerah",
      code: "BD",
      kkm: 70,
      teacher: "Ratna Sari, S.Pd",
      semester: "Ganjil 2024/2025",
      credits: 2,
      category: "pilihan",
    },
  ]

  const gradeData: StudentGrade[] = [
    {
      subjectId: 1,
      utsScore: 85,
      uasScore: 88,
      dailyScores: [80, 85, 90],
      finalScore: 86.5,
      grade: "A",
      status: "lulus",
    },
    {
      subjectId: 2,
      utsScore: 78,
      uasScore: 82,
      dailyScores: [75, 80, 85],
      finalScore: 80,
      grade: "B",
      status: "lulus",
    },
    {
      subjectId: 3,
      utsScore: 82,
      uasScore: 85,
      dailyScores: [78, 82, 88],
      finalScore: 83.5,
      grade: "B",
      status: "lulus",
    },
    {
      subjectId: 4,
      utsScore: 90,
      uasScore: 92,
      dailyScores: [88, 90, 95],
      finalScore: 91,
      grade: "A",
      status: "lulus",
    },
    {
      subjectId: 5,
      utsScore: 75,
      uasScore: 78,
      dailyScores: [72, 75, 80],
      finalScore: 76.5,
      grade: "B",
      status: "lulus",
    },
    {
      subjectId: 6,
      utsScore: 88,
      uasScore: 90,
      dailyScores: [85, 88, 92],
      finalScore: 89,
      grade: "A",
      status: "lulus",
    },
    {
      subjectId: 7,
      utsScore: 92,
      uasScore: 95,
      dailyScores: [90, 92, 95],
      finalScore: 93.5,
      grade: "A",
      status: "lulus",
    },
    {
      subjectId: 8,
      utsScore: 85,
      uasScore: 87,
      dailyScores: [82, 85, 90],
      finalScore: 86,
      grade: "A",
      status: "lulus",
    },
    {
      subjectId: 9,
      utsScore: 90,
      uasScore: 88,
      dailyScores: [85, 90, 92],
      finalScore: 89,
      grade: "A",
      status: "lulus",
    },
    {
      subjectId: 10,
      utsScore: 80,
      uasScore: 82,
      dailyScores: [78, 80, 85],
      finalScore: 81,
      grade: "B",
      status: "lulus",
    },
    {
      subjectId: 11,
      utsScore: 95,
      uasScore: 98,
      dailyScores: [92, 95, 98],
      finalScore: 96.5,
      grade: "A",
      status: "lulus",
    },
    {
      subjectId: 12,
      utsScore: 78,
      uasScore: 80,
      dailyScores: [75, 78, 82],
      finalScore: 79,
      grade: "B",
      status: "lulus",
    },
  ]

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    if (currentUser.userType !== "siswa") {
      router.push("/dashboard")
      return
    }
    setUser(currentUser)
    setSubjects(subjectData)
    setGrades(gradeData)
  }, [router])

  const getGradeForSubject = (subjectId: number) => {
    return grades.find((grade) => grade.subjectId === subjectId)
  }

  const getKKMStatus = (finalScore: number | undefined, kkm: number) => {
    if (!finalScore) return "belum_dinilai"
    return finalScore >= kkm ? "lulus" : "tidak_lulus"
  }

  const getKKMStatusColor = (status: string) => {
    switch (status) {
      case "lulus":
        return "bg-green-100 text-green-800 border-green-300"
      case "tidak_lulus":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getGradeColor = (grade: string | undefined) => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800"
      case "B":
        return "bg-blue-100 text-blue-800"
      case "C":
        return "bg-yellow-100 text-yellow-800"
      case "D":
        return "bg-orange-100 text-orange-800"
      case "E":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateOverallStats = () => {
    const totalSubjects = subjects.length
    const gradedSubjects = grades.filter((g) => g.finalScore !== undefined).length
    const passedSubjects = grades.filter((g) => {
      const subject = subjects.find((s) => s.id === g.subjectId)
      return g.finalScore && subject && g.finalScore >= subject.kkm
    }).length
    const averageScore = grades.reduce((sum, g) => sum + (g.finalScore || 0), 0) / (gradedSubjects || 1)

    return {
      totalSubjects,
      gradedSubjects,
      passedSubjects,
      averageScore: averageScore.toFixed(1),
    }
  }

  const stats = calculateOverallStats()

  if (!user) return null

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
                <h1 className="text-xl font-bold">Mata Pelajaran & Nilai KKM</h1>
                <p className="text-blue-100 text-sm">Daftar mata pelajaran dan nilai KKM - Ahmad Rizki (7A)</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Mata Pelajaran</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSubjects}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sudah Dinilai</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.gradedSubjects}</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lulus KKM</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.passedSubjects}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rata-rata Nilai</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageScore}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subjects Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Daftar Mata Pelajaran & Nilai</span>
              <Badge variant="secondary" className="ml-2">
                Semester Ganjil 2024/2025
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Mata Pelajaran</TableHead>
                    <TableHead>Kode</TableHead>
                    <TableHead>Guru Pengajar</TableHead>
                    <TableHead>SKS</TableHead>
                    <TableHead>KKM</TableHead>
                    <TableHead>Nilai UTS</TableHead>
                    <TableHead>Nilai UAS</TableHead>
                    <TableHead>Nilai Akhir</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status KKM</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject, index) => {
                    const grade = getGradeForSubject(subject.id)
                    const kkmStatus = getKKMStatus(grade?.finalScore, subject.kkm)

                    return (
                      <TableRow key={subject.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{subject.name}</div>
                            <Badge
                              variant="outline"
                              className={
                                subject.category === "wajib"
                                  ? "bg-blue-100 text-blue-800 text-xs"
                                  : "bg-purple-100 text-purple-800 text-xs"
                              }
                            >
                              {subject.category === "wajib" ? "Wajib" : "Pilihan"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{subject.code}</TableCell>
                        <TableCell className="text-sm">{subject.teacher}</TableCell>
                        <TableCell className="text-center">{subject.credits}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 font-semibold">
                            {subject.kkm}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {grade?.utsScore ? (
                            <span
                              className={`px-2 py-1 rounded text-sm font-medium ${
                                grade.utsScore >= subject.kkm
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {grade.utsScore}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {grade?.uasScore ? (
                            <span
                              className={`px-2 py-1 rounded text-sm font-medium ${
                                grade.uasScore >= subject.kkm
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {grade.uasScore}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {grade?.finalScore ? (
                            <span
                              className={`px-2 py-1 rounded text-sm font-semibold ${
                                grade.finalScore >= subject.kkm
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {grade.finalScore}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {grade?.grade ? (
                            <Badge className={getGradeColor(grade.grade)}>{grade.grade}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getKKMStatusColor(kkmStatus)}>
                            {kkmStatus === "lulus"
                              ? "Lulus"
                              : kkmStatus === "tidak_lulus"
                                ? "Tidak Lulus"
                                : "Belum Dinilai"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Keterangan Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>A (Sangat Baik)</span>
                  <span className="font-medium">90 - 100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>B (Baik)</span>
                  <span className="font-medium">80 - 89</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>C (Cukup)</span>
                  <span className="font-medium">70 - 79</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>D (Kurang)</span>
                  <span className="font-medium">60 - 69</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>E (Sangat Kurang)</span>
                  <span className="font-medium">{"< 60"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasi KKM</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p>
                  <strong>KKM (Kriteria Ketuntasan Minimal)</strong> adalah nilai minimal yang harus dicapai siswa untuk
                  dinyatakan tuntas dalam suatu mata pelajaran.
                </p>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium text-blue-800">Status Anda:</p>
                  <p className="text-blue-700">
                    {stats.passedSubjects} dari {stats.gradedSubjects} mata pelajaran telah mencapai KKM
                  </p>
                </div>
                {stats.passedSubjects < stats.gradedSubjects && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="font-medium text-yellow-800">Perhatian:</p>
                    <p className="text-yellow-700">
                      Masih ada mata pelajaran yang belum mencapai KKM. Konsultasikan dengan guru mata pelajaran
                      terkait.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
