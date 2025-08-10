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
  GraduationCap,
  ArrowLeft,
  Search,
  CheckSquare,
  Users,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface ParentChecklistData {
  parentName: string
  studentName: string
  studentClass: string
  checkedItems: string[]
  lastUpdated: string
}

const checklistItems = [
  {
    id: "rapor-semester",
    title: "Konfirmasi Penerimaan Rapor Semester",
    category: "akademik",
    required: true,
  },
  {
    id: "pembayaran-spp",
    title: "Konfirmasi Pembayaran SPP Bulan Ini",
    category: "administrasi",
    required: true,
  },
  {
    id: "izin-kegiatan",
    title: "Izin Kegiatan Ekstrakurikuler",
    category: "kegiatan",
    required: false,
  },
  {
    id: "data-kesehatan",
    title: "Update Data Kesehatan Anak",
    category: "administrasi",
    required: false,
  },
  {
    id: "persetujuan-foto",
    title: "Persetujuan Penggunaan Foto",
    category: "administrasi",
    required: false,
  },
  {
    id: "konsultasi-guru",
    title: "Konfirmasi Jadwal Konsultasi",
    category: "akademik",
    required: true,
  },
]

export default function ParentChecklistRecap() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [parentData, setParentData] = useState<ParentChecklistData[]>([])
  const [user, setUser] = useState<any>(null)
  const [classes, setClasses] = useState<string[]>([])
  const router = useRouter()

  const categories = ["akademik", "administrasi", "kegiatan"]

  useEffect(() => {
    const initializePage = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/")
        return
      }
      if (currentUser.userType !== "admin") {
        router.push("/dashboard")
        return
      }
      setUser(currentUser)
      await loadParentData()
    }
    
    initializePage()
  }, [router])

  const loadParentData = async () => {
    try {
      // Load parent checklist data with user and student information
      const { data: checklistData, error: checklistError } = await supabase
        .from('parent_checklists')
        .select(`
          *,
          users!parent_checklists_parent_user_id_fkey(name),
          students!inner(name, class)
        `)

      if (checklistError) throw checklistError

      // Group by parent and aggregate data
      const groupedData = (checklistData || []).reduce((acc, item: any) => {
        const parentId = item.parent_user_id
        if (!acc[parentId]) {
          acc[parentId] = {
            parentName: item.users.name,
            studentName: item.students.name,
            studentClass: item.students.class,
            checkedItems: [],
            lastUpdated: item.last_updated
          }
        }
        
        if (item.is_checked) {
          acc[parentId].checkedItems.push(item.item_id)
        }
        
        // Keep the latest update time
        if (new Date(item.last_updated) > new Date(acc[parentId].lastUpdated)) {
          acc[parentId].lastUpdated = item.last_updated
        }
        
        return acc
      }, {} as any)

      const formattedData: ParentChecklistData[] = Object.values(groupedData)
      setParentData(formattedData)

      // Extract unique classes
      const uniqueClasses = [...new Set(formattedData.map(d => d.studentClass))].sort()
      setClasses(uniqueClasses)

    } catch (error) {
      console.error('Error loading parent data:', error)
    }
  }

  const filteredData = parentData.filter((data) => {
    const matchesSearch =
      data.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = selectedClass === "all" || data.studentClass === selectedClass
    return matchesSearch && matchesClass
  })

  const getCompletionRate = (checkedItems: string[]) => {
    return ((checkedItems.length / checklistItems.length) * 100).toFixed(1)
  }

  const getRequiredCompletionRate = (checkedItems: string[]) => {
    const requiredItems = checklistItems.filter((item) => item.required)
    const completedRequired = checkedItems.filter((id) => requiredItems.some((item) => item.id === id)).length
    return ((completedRequired / requiredItems.length) * 100).toFixed(1)
  }

  const getOverallStats = () => {
    const totalParents = parentData.length
    const totalItems = checklistItems.length
    const requiredItems = checklistItems.filter((item) => item.required).length

    let totalCompleted = 0
    let totalRequiredCompleted = 0
    let fullyCompletedParents = 0

    parentData.forEach((data) => {
      totalCompleted += data.checkedItems.length
      totalRequiredCompleted += data.checkedItems.filter((id) =>
        checklistItems.some((item) => item.id === id && item.required),
      ).length
      if (data.checkedItems.length === totalItems) {
        fullyCompletedParents++
      }
    })

    return {
      totalParents,
      totalItems,
      requiredItems,
      averageCompletion: totalParents > 0 ? ((totalCompleted / (totalParents * totalItems)) * 100).toFixed(1) : "0",
      averageRequiredCompletion:
        totalParents > 0 ? ((totalRequiredCompleted / (totalParents * requiredItems)) * 100).toFixed(1) : "0",
      fullyCompletedParents,
    }
  }

  const getCategoryStats = () => {
    const stats: { [key: string]: { completed: number; total: number } } = {}

    categories.forEach((category) => {
      const categoryItems = checklistItems.filter((item) => item.category === category)
      let completed = 0

      parentData.forEach((data) => {
        completed += data.checkedItems.filter((id) => categoryItems.some((item) => item.id === id)).length
      })

      stats[category] = {
        completed,
        total: parentData.length * categoryItems.length,
      }
    })

    return stats
  }

  const handleExport = () => {
    const csvContent = [
      ["Nama Orang Tua", "Nama Siswa", "Kelas", "Item Selesai", "Tingkat Penyelesaian", "Terakhir Update"],
      ...filteredData.map((data) => [
        data.parentName,
        data.studentName,
        data.studentClass,
        `${data.checkedItems.length}/${checklistItems.length}`,
        `${getCompletionRate(data.checkedItems)}%`,
        new Date(data.lastUpdated).toLocaleString("id-ID"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `rekap-checklist-orangtua-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const overallStats = getOverallStats()
  const categoryStats = getCategoryStats()

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
                <h1 className="text-xl font-bold">Rekap Checklist Orang Tua</h1>
                <p className="text-blue-100 text-sm">Monitor checklist yang telah diselesaikan orang tua</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Orang Tua</p>
                  <p className="text-2xl font-bold text-gray-900">{overallStats.totalParents}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rata-rata Penyelesaian</p>
                  <p className="text-2xl font-bold text-gray-900">{overallStats.averageCompletion}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Item Wajib Selesai</p>
                  <p className="text-2xl font-bold text-gray-900">{overallStats.averageRequiredCompletion}%</p>
                </div>
                <CheckSquare className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Selesai 100%</p>
                  <p className="text-2xl font-bold text-gray-900">{overallStats.fullyCompletedParents}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari nama orang tua atau siswa"
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
              <Button onClick={loadParentData} variant="outline" className="h-10 px-4 bg-transparent">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleExport} className="h-10 px-4 bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckSquare className="h-5 w-5" />
              <span>Rekap Checklist Orang Tua</span>
              <Badge variant="secondary" className="ml-2">
                {filteredData.length} orang tua
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="detailed">Detail Per Orang Tua</TabsTrigger>
                <TabsTrigger value="category">Per Kategori</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Nama Orang Tua</TableHead>
                        <TableHead>Nama Siswa</TableHead>
                        <TableHead>Kelas</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Item Wajib</TableHead>
                        <TableHead>Terakhir Update</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((data, index) => {
                        const completionRate = Number.parseFloat(getCompletionRate(data.checkedItems))
                        const requiredRate = Number.parseFloat(getRequiredCompletionRate(data.checkedItems))
                        const isFullyCompleted = completionRate === 100
                        const requiredCompleted = requiredRate === 100

                        return (
                          <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{data.parentName}</TableCell>
                            <TableCell>{data.studentName}</TableCell>
                            <TableCell>{data.studentClass}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      completionRate >= 80
                                        ? "bg-green-500"
                                        : completionRate >= 50
                                          ? "bg-yellow-500"
                                          : "bg-red-500"
                                    }`}
                                    style={{ width: `${completionRate}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{completionRate}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  requiredCompleted
                                    ? "bg-green-100 text-green-800 border-green-300"
                                    : "bg-red-100 text-red-800 border-red-300"
                                }
                              >
                                {requiredRate}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {new Date(data.lastUpdated).toLocaleDateString("id-ID")}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  isFullyCompleted
                                    ? "bg-green-100 text-green-800 border-green-300"
                                    : requiredCompleted
                                      ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                      : "bg-red-100 text-red-800 border-red-300"
                                }
                              >
                                {isFullyCompleted ? "Lengkap" : requiredCompleted ? "Wajib Selesai" : "Belum Lengkap"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="detailed" className="mt-6">
                <div className="space-y-6">
                  {filteredData.map((data, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>
                            {data.parentName} - {data.studentName} ({data.studentClass})
                          </span>
                          <Badge variant="secondary">
                            {data.checkedItems.length}/{checklistItems.length} selesai
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          {checklistItems.map((item) => (
                            <div
                              key={item.id}
                              className={`flex items-center space-x-3 p-3 rounded-lg border ${
                                data.checkedItems.includes(item.id)
                                  ? "bg-green-50 border-green-200"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                  data.checkedItems.includes(item.id)
                                    ? "bg-green-500 border-green-500"
                                    : "border-gray-300"
                                }`}
                              >
                                {data.checkedItems.includes(item.id) && <CheckSquare className="w-3 h-3 text-white" />}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{item.title}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge
                                    variant="outline"
                                    className={
                                      item.category === "akademik"
                                        ? "bg-blue-100 text-blue-800"
                                        : item.category === "administrasi"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-purple-100 text-purple-800"
                                    }
                                  >
                                    {item.category}
                                  </Badge>
                                  {item.required && (
                                    <Badge variant="outline" className="bg-red-100 text-red-800">
                                      Wajib
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="category" className="mt-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {categories.map((category) => {
                    const stats = categoryStats[category]
                    const percentage = stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : "0"

                    return (
                      <Card key={category}>
                        <CardHeader>
                          <CardTitle className="capitalize">{category}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Progress</span>
                              <span className="font-medium">{percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className={`h-3 rounded-full ${
                                  Number.parseFloat(percentage) >= 80
                                    ? "bg-green-500"
                                    : Number.parseFloat(percentage) >= 50
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="text-sm text-gray-600">
                              {stats.completed} dari {stats.total} item selesai
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
