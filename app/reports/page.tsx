"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, ArrowLeft, Printer, Download, FileText, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState("uts-uas")
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")

  const reportTypes = [
    { value: "uts-uas", label: "Laporan Nilai UTS & UAS" },
    { value: "daily", label: "Laporan Nilai Ulangan Harian" },
    { value: "attendance", label: "Laporan Absensi Siswa" },
    { value: "extracurricular", label: "Laporan Ekstrakurikuler" },
    { value: "comprehensive", label: "Laporan Komprehensif" },
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

  const handlePrint = () => {
    if (!selectedReport) {
      alert("Pilih jenis laporan terlebih dahulu")
      return
    }
    window.print()
  }

  const handleDownload = () => {
    if (!selectedReport) {
      alert("Pilih jenis laporan terlebih dahulu")
      return
    }
    // Simulate download
    alert("Laporan berhasil diunduh!")
  }

  const generatePreview = () => {
    if (!selectedReport) return null

    const sampleData = {
      "uts-uas": {
        title: "Laporan Nilai UTS & UAS",
        data: [
          { name: "Ahmad Rizki", class: "7A", uts: 85, uas: 88, average: 86.5 },
          { name: "Siti Nurhaliza", class: "7A", uts: 92, uas: 90, average: 91 },
          { name: "Budi Santoso", class: "7A", uts: 78, uas: 82, average: 80 },
        ],
      },
      daily: {
        title: "Laporan Nilai Ulangan Harian",
        data: [
          { name: "Ahmad Rizki", class: "7A", ul1: 85, ul2: 88, average: 86.5 },
          { name: "Siti Nurhaliza", class: "7A", ul1: 92, ul2: 90, average: 91 },
        ],
      },
      attendance: {
        title: "Laporan Absensi Siswa",
        data: [
          { name: "Ahmad Rizki", class: "7A", present: 85, sick: 3, permission: 2, absent: 1 },
          { name: "Siti Nurhaliza", class: "7A", present: 88, sick: 2, permission: 1, absent: 0 },
        ],
      },
    }

    return sampleData[selectedReport as keyof typeof sampleData] || null
  }

  const previewData = generatePreview()

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
                <h1 className="text-xl font-bold">Laporan</h1>
                <p className="text-blue-100 text-sm">Generate dan print laporan akademik</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Report Configuration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Konfigurasi Laporan</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end mb-6">
              <div className="w-full sm:w-64">
                <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Laporan</label>
                <Select value={selectedReport} onValueChange={setSelectedReport}>
                  <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500">
                    <SelectValue placeholder="Pilih Jenis Laporan" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
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

              {(selectedReport === "uts-uas" || selectedReport === "daily") && (
                <div className="w-full sm:w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mata Pelajaran</label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500">
                      <SelectValue placeholder="Semua Mata Pelajaran" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handlePrint}
                className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Laporan
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="h-10 px-6 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-md bg-transparent"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Preview */}
        {previewData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Preview Laporan: {previewData.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-6 border rounded-lg print:shadow-none">
                {/* Report Header */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-800">SMP Negeri 4 Boyolali</h1>
                  <p className="text-gray-600">Jl. Pendidikan No. 123, Nusantara</p>
                  <p className="text-gray-600">Telp: (021) 12345678</p>
                  <hr className="my-4" />
                  <h2 className="text-xl font-semibold">{previewData.title}</h2>
                  <p className="text-gray-600">
                    Semester: Ganjil 2024/2025 |{selectedClass && ` Kelas: ${selectedClass} |`}
                    {selectedSubject && ` Mata Pelajaran: ${selectedSubject}`}
                  </p>
                </div>

                {/* Report Content */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">No</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Nama Siswa</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Kelas</th>
                        {selectedReport === "uts-uas" && (
                          <>
                            <th className="border border-gray-300 px-4 py-2 text-center">UTS</th>
                            <th className="border border-gray-300 px-4 py-2 text-center">UAS</th>
                            <th className="border border-gray-300 px-4 py-2 text-center">Rata-rata</th>
                          </>
                        )}
                        {selectedReport === "daily" && (
                          <>
                            <th className="border border-gray-300 px-4 py-2 text-center">Ulangan 1</th>
                            <th className="border border-gray-300 px-4 py-2 text-center">Ulangan 2</th>
                            <th className="border border-gray-300 px-4 py-2 text-center">Rata-rata</th>
                          </>
                        )}
                        {selectedReport === "attendance" && (
                          <>
                            <th className="border border-gray-300 px-4 py-2 text-center">Hadir</th>
                            <th className="border border-gray-300 px-4 py-2 text-center">Sakit</th>
                            <th className="border border-gray-300 px-4 py-2 text-center">Izin</th>
                            <th className="border border-gray-300 px-4 py-2 text-center">Alfa</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.data.map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                          <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                          <td className="border border-gray-300 px-4 py-2">{item.class}</td>
                          {selectedReport === "uts-uas" && (
                            <>
                              <td className="border border-gray-300 px-4 py-2 text-center">{item.uts}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">{item.uas}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                                {item.average}
                              </td>
                            </>
                          )}
                          {selectedReport === "daily" && (
                            <>
                              <td className="border border-gray-300 px-4 py-2 text-center">{item.ul1}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">{item.ul2}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                                {item.average}
                              </td>
                            </>
                          )}
                          {selectedReport === "attendance" && (
                            <>
                              <td className="border border-gray-300 px-4 py-2 text-center">{item.present}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">{item.sick}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">{item.permission}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">{item.absent}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Report Footer */}
                <div className="mt-8 flex justify-between items-end">
                  <div>
                    <p className="text-sm text-gray-600">
                      Dicetak pada:{" "}
                      {new Date().toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-16">Kepala Sekolah</p>
                    <p className="text-sm font-semibold border-t border-gray-400 pt-1">Drs. H. Ahmad Suryadi, M.Pd</p>
                    <p className="text-xs text-gray-600">NIP. 196505151990031007</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Laporan Nilai</h3>
              <p className="text-gray-600 text-sm mb-4">Generate laporan nilai UTS, UAS, dan ulangan harian</p>
              <Button onClick={() => setSelectedReport("uts-uas")} variant="outline" size="sm">
                Pilih
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Laporan Absensi</h3>
              <p className="text-gray-600 text-sm mb-4">Generate laporan kehadiran dan absensi siswa</p>
              <Button onClick={() => setSelectedReport("attendance")} variant="outline" size="sm">
                Pilih
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Laporan Komprehensif</h3>
              <p className="text-gray-600 text-sm mb-4">Generate laporan lengkap semua data akademik</p>
              <Button onClick={() => setSelectedReport("comprehensive")} variant="outline" size="sm">
                Pilih
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
