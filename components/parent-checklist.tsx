"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, Clock, AlertCircle, CheckCircle } from "lucide-react"

interface ChecklistItem {
  id: string
  title: string
  description: string
  category: "akademik" | "administrasi" | "kegiatan"
  required: boolean
  deadline?: string
}

const checklistItems: ChecklistItem[] = [
  {
    id: "rapor-semester",
    title: "Konfirmasi Penerimaan Rapor Semester",
    description: "Konfirmasi bahwa Anda telah menerima dan memeriksa rapor semester anak",
    category: "akademik",
    required: true,
    deadline: "2025-01-31",
  },
  {
    id: "pembayaran-spp",
    title: "Konfirmasi Pembayaran SPP Bulan Ini",
    description: "Konfirmasi pembayaran SPP untuk bulan berjalan",
    category: "administrasi",
    required: true,
    deadline: "2025-01-15",
  },
  {
    id: "izin-kegiatan",
    title: "Izin Kegiatan Ekstrakurikuler",
    description: "Berikan izin untuk kegiatan ekstrakurikuler anak",
    category: "kegiatan",
    required: false,
  },
  {
    id: "data-kesehatan",
    title: "Update Data Kesehatan Anak",
    description: "Perbarui informasi kesehatan dan alergi anak jika ada perubahan",
    category: "administrasi",
    required: false,
  },
  {
    id: "persetujuan-foto",
    title: "Persetujuan Penggunaan Foto",
    description: "Izin penggunaan foto anak untuk dokumentasi sekolah",
    category: "administrasi",
    required: false,
  },
  {
    id: "konsultasi-guru",
    title: "Konfirmasi Jadwal Konsultasi",
    description: "Konfirmasi kehadiran dalam sesi konsultasi dengan wali kelas",
    category: "akademik",
    required: true,
    deadline: "2025-01-20",
  },
]

export function ParentChecklist() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [lastUpdated, setLastUpdated] = useState<string>("")

  useEffect(() => {
    // Load saved checklist from localStorage
    const saved = localStorage.getItem("parent-checklist")
    if (saved) {
      const data = JSON.parse(saved)
      setCheckedItems(new Set(data.checkedItems))
      setLastUpdated(data.lastUpdated)
    }
  }, [])

  const handleItemCheck = (itemId: string, checked: boolean) => {
    const newCheckedItems = new Set(checkedItems)
    if (checked) {
      newCheckedItems.add(itemId)
    } else {
      newCheckedItems.delete(itemId)
    }

    setCheckedItems(newCheckedItems)
    const now = new Date().toISOString()
    setLastUpdated(now)

    // Save to localStorage
    const dataToSave = {
      checkedItems: Array.from(newCheckedItems),
      lastUpdated: now,
      parentName: "Budi Santoso",
      studentName: "Ahmad Rizki",
      studentClass: "7A",
    }
    localStorage.setItem("parent-checklist", JSON.stringify(dataToSave))

    // Also save to a global checklist for admin view
    const existingGlobalData = localStorage.getItem("global-parent-checklist") || "[]"
    const globalData = JSON.parse(existingGlobalData)

    // Update or add this parent's data
    const existingIndex = globalData.findIndex((item: any) => item.parentName === "Budi Santoso")
    if (existingIndex >= 0) {
      globalData[existingIndex] = dataToSave
    } else {
      globalData.push(dataToSave)
    }

    localStorage.setItem("global-parent-checklist", JSON.stringify(globalData))
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "akademik":
        return "📚"
      case "administrasi":
        return "📋"
      case "kegiatan":
        return "🎯"
      default:
        return "📝"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "akademik":
        return "bg-blue-100 text-blue-800"
      case "administrasi":
        return "bg-green-100 text-green-800"
      case "kegiatan":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false
    return new Date(deadline) < new Date()
  }

  const getItemStatus = (item: ChecklistItem) => {
    const isChecked = checkedItems.has(item.id)
    const overdue = isOverdue(item.deadline)

    if (isChecked) return { status: "completed", icon: CheckCircle, color: "text-green-600" }
    if (overdue) return { status: "overdue", icon: AlertCircle, color: "text-red-600" }
    if (item.deadline) return { status: "pending", icon: Clock, color: "text-yellow-600" }
    return { status: "optional", icon: CheckSquare, color: "text-gray-600" }
  }

  const completedCount = checkedItems.size
  const requiredCount = checklistItems.filter((item) => item.required).length
  const requiredCompleted = checklistItems.filter((item) => item.required && checkedItems.has(item.id)).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <CheckSquare className="h-5 w-5" />
            <span>Checklist Orang Tua</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {completedCount}/{checklistItems.length} Selesai
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {requiredCompleted}/{requiredCount} Wajib
            </Badge>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Silakan centang item-item berikut untuk konfirmasi. Item dengan tanda * wajib diselesaikan.
        </p>
        {lastUpdated && (
          <p className="text-xs text-gray-500">Terakhir diperbarui: {new Date(lastUpdated).toLocaleString("id-ID")}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checklistItems.map((item) => {
            const itemStatus = getItemStatus(item)
            const StatusIcon = itemStatus.icon

            return (
              <div
                key={item.id}
                className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors ${
                  checkedItems.has(item.id)
                    ? "bg-green-50 border-green-200"
                    : isOverdue(item.deadline)
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200"
                }`}
              >
                <Checkbox
                  id={item.id}
                  checked={checkedItems.has(item.id)}
                  onCheckedChange={(checked) => handleItemCheck(item.id, checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{getCategoryIcon(item.category)}</span>
                    <label
                      htmlFor={item.id}
                      className={`font-medium cursor-pointer ${
                        checkedItems.has(item.id) ? "line-through text-gray-500" : "text-gray-900"
                      }`}
                    >
                      {item.title}
                      {item.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <StatusIcon className={`h-4 w-4 ${itemStatus.color}`} />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <div className="flex items-center space-x-2">
                    <Badge className={getCategoryColor(item.category)}>
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </Badge>
                    {item.deadline && (
                      <Badge
                        variant="outline"
                        className={
                          isOverdue(item.deadline)
                            ? "border-red-300 text-red-700 bg-red-50"
                            : "border-yellow-300 text-yellow-700 bg-yellow-50"
                        }
                      >
                        Deadline: {new Date(item.deadline).toLocaleDateString("id-ID")}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium text-blue-900">Status Checklist</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Item:</span>
              <span className="font-medium ml-2">{checklistItems.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Diselesaikan:</span>
              <span className="font-medium ml-2 text-green-600">{completedCount}</span>
            </div>
            <div>
              <span className="text-gray-600">Item Wajib:</span>
              <span className="font-medium ml-2">{requiredCount}</span>
            </div>
            <div>
              <span className="text-gray-600">Wajib Selesai:</span>
              <span className="font-medium ml-2 text-green-600">{requiredCompleted}</span>
            </div>
          </div>
          {requiredCompleted === requiredCount && (
            <div className="mt-3 p-2 bg-green-100 rounded text-green-800 text-sm">
              ✅ Semua item wajib telah diselesaikan!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
