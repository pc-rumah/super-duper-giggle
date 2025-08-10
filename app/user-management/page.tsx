"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import { GraduationCap, ArrowLeft, Search, UserPlus, Edit, Trash2, Eye, EyeOff, RefreshCw } from "lucide-react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface UserAccount {
  id: number
  username: string
  password: string
  userType: "siswa" | "orangtua" | "guru" | "admin"
  studentName: string
  studentClass: string
  nisn: string
  parentName?: string
  isActive: boolean
  createdAt: string
  lastLogin?: string
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUserType, setSelectedUserType] = useState("all")
  const [selectedClass, setSelectedClass] = useState("all")
  const [users, setUsers] = useState<UserAccount[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null)
  const [showPasswords, setShowPasswords] = useState<{ [key: number]: boolean }>({})
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    userType: "siswa" as "siswa" | "orangtua" | "guru" | "admin",
    studentName: "",
    studentClass: "",
    nisn: "",
    parentName: "",
  })

  const [user, setUser] = useState<any>(null)
  const [classes, setClasses] = useState<string[]>([])
  const router = useRouter()

  const userTypes = [
    { value: "siswa", label: "Siswa" },
    { value: "orangtua", label: "Orang Tua" },
    { value: "guru", label: "Guru" },
    { value: "admin", label: "Admin" },
  ]

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
      await loadUsers()
    }
    
    initializePage()
  }, [router])

  const loadUsers = async () => {
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      const formattedUsers: UserAccount[] = (usersData || []).map((user: any) => ({
        id: user.id,
        username: user.username,
        password: user.password,
        userType: user.user_type,
        studentName: user.name,
        studentClass: user.class || '',
        nisn: user.nisn || '',
        parentName: user.parent_name,
        isActive: user.is_active,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      }))

      setUsers(formattedUsers)

      // Extract unique classes
      const uniqueClasses = [...new Set(formattedUsers.map(u => u.studentClass).filter(Boolean))].sort()
      setClasses(uniqueClasses)

    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.parentName && user.parentName.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesUserType = selectedUserType === "all" || user.userType === selectedUserType
    const matchesClass = selectedClass === "all" || user.studentClass === selectedClass
    return matchesSearch && matchesUserType && matchesClass
  })

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      userType: "siswa",
      studentName: "",
      studentClass: "",
      nisn: "",
      parentName: "",
    })
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let password = ""
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData((prev) => ({ ...prev, password }))
  }

  const handleAddUser = async () => {
    if (!formData.username || !formData.password || !formData.studentName || !formData.studentClass) {
      alert("Mohon lengkapi data wajib")
      return
    }

    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', formData.username)
        .single()

      if (existingUser) {
        alert("Username sudah digunakan")
        return
      }

      const { error } = await supabase
        .from('users')
        .insert({
          username: formData.username,
          password: formData.password,
          user_type: formData.userType,
          name: formData.studentName,
          class: formData.studentClass,
          nisn: formData.nisn || null,
          parent_name: formData.parentName || null,
          is_active: true,
        })

      if (error) throw error

      await loadUsers()
      setIsAddDialogOpen(false)
      resetForm()
      alert("User berhasil ditambahkan!")
    } catch (error) {
      console.error('Error adding user:', error)
      alert("Gagal menambahkan user")
    }
  }

  const handleEditUser = (user: UserAccount) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      password: user.password,
      userType: user.userType,
      studentName: user.studentName,
      studentClass: user.studentClass,
      nisn: user.nisn,
      parentName: user.parentName || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!formData.username || !formData.password || !formData.studentName || !formData.studentClass) {
      alert("Mohon lengkapi data wajib")
      return
    }

    if (!editingUser) return

    try {
      // Check if username already exists (excluding current user)
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', formData.username)
        .neq('id', editingUser.id)
        .single()

      if (existingUser) {
        alert("Username sudah digunakan")
        return
      }

      const { error } = await supabase
        .from('users')
        .update({
          username: formData.username,
          password: formData.password,
          user_type: formData.userType,
          name: formData.studentName,
          class: formData.studentClass,
          nisn: formData.nisn || null,
          parent_name: formData.parentName || null,
        })
        .eq('id', editingUser.id)

      if (error) throw error

      await loadUsers()
      setIsEditDialogOpen(false)
      setEditingUser(null)
      resetForm()
      alert("User berhasil diperbarui!")
    } catch (error) {
      console.error('Error updating user:', error)
      alert("Gagal memperbarui user")
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) throw error

      await loadUsers()
      alert("User berhasil dihapus!")
    } catch (error) {
      console.error('Error deleting user:', error)
      alert("Gagal menghapus user")
    }
  }

  const toggleUserStatus = async (userId: number) => {
    try {
      const user = users.find(u => u.id === userId)
      if (!user) return

      const { error } = await supabase
        .from('users')
        .update({ is_active: !user.isActive })
        .eq('id', userId)

      if (error) throw error

      await loadUsers()
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }

  const togglePasswordVisibility = (userId: number) => {
    setShowPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }))
  }

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "siswa":
        return "bg-blue-100 text-blue-800"
      case "orangtua":
        return "bg-green-100 text-green-800"
      case "guru":
        return "bg-purple-100 text-purple-800"
      case "admin":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const UserForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="userType">Tipe User *</Label>
          <Select
            value={formData.userType}
            onValueChange={(value: "siswa" | "orangtua" | "guru" | "admin") =>
              setFormData((prev) => ({ ...prev, userType: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih tipe user" />
            </SelectTrigger>
            <SelectContent>
              {userTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
            placeholder="Masukkan username"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <div className="flex space-x-2">
          <Input
            id="password"
            type="text"
            value={formData.password}
            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="Masukkan password"
          />
          <Button type="button" onClick={generatePassword} variant="outline">
            Generate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="studentName">Nama Siswa *</Label>
          <Input
            id="studentName"
            value={formData.studentName}
            onChange={(e) => setFormData((prev) => ({ ...prev, studentName: e.target.value }))}
            placeholder="Masukkan nama siswa"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="studentClass">Kelas *</Label>
          <Select
            value={formData.studentClass}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, studentClass: value }))}
          >
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nisn">NISN</Label>
          <Input
            id="nisn"
            value={formData.nisn}
            onChange={(e) => setFormData((prev) => ({ ...prev, nisn: e.target.value }))}
            placeholder="Masukkan NISN"
          />
        </div>
        {formData.userType === "orangtua" && (
          <div className="space-y-2">
            <Label htmlFor="parentName">Nama Orang Tua</Label>
            <Input
              id="parentName"
              value={formData.parentName}
              onChange={(e) => setFormData((prev) => ({ ...prev, parentName: e.target.value }))}
              placeholder="Masukkan nama orang tua"
            />
          </div>
        )}
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
                <h1 className="text-xl font-bold">Manajemen User</h1>
                <p className="text-blue-100 text-sm">Kelola akun pengguna sistem</p>
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
                  <p className="text-sm font-medium text-gray-600">Total User</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <UserPlus className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Siswa</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.userType === "siswa").length}
                  </p>
                </div>
                <GraduationCap className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Orang Tua</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.userType === "orangtua").length}
                  </p>
                </div>
                <UserPlus className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">User Aktif</p>
                  <p className="text-2xl font-bold text-gray-900">{users.filter((u) => u.isActive).length}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-orange-600" />
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
                    placeholder="Cari username, nama siswa, atau orang tua"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                  <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500">
                    <SelectValue placeholder="Semua Tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tipe</SelectItem>
                    {userTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="h-10 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Tambah User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Tambah User Baru</DialogTitle>
                    <DialogDescription>
                      Lengkapi form di bawah untuk menambahkan user baru. Field dengan tanda * wajib diisi.
                    </DialogDescription>
                  </DialogHeader>
                  <UserForm />
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
                    <Button onClick={handleAddUser} className="bg-green-600 hover:bg-green-700">
                      Tambah User
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Daftar User</span>
              <Badge variant="secondary" className="ml-2">
                {filteredUsers.length} user
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Password</TableHead>
                    <TableHead>Tipe User</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Terakhir Login</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm">
                            {showPasswords[user.id] ? user.password : "••••••••"}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePasswordVisibility(user.id)}
                            className="h-6 w-6 p-0"
                          >
                            {showPasswords[user.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getUserTypeColor(user.userType)}>
                          {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.studentName}</TableCell>
                      <TableCell>{user.studentClass}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUserStatus(user.id)}
                          className={`h-6 px-2 text-xs ${
                            user.isActive
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                        >
                          {user.isActive ? "Aktif" : "Nonaktif"}
                        </Button>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("id-ID") : "Belum pernah"}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
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
                                <AlertDialogTitle>Hapus User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus user <strong>{user.username}</strong>? Tindakan ini
                                  tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Perbarui informasi user. Field dengan tanda * wajib diisi.</DialogDescription>
          </DialogHeader>
          <UserForm isEdit={true} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setEditingUser(null)
                resetForm()
              }}
            >
              Batal
            </Button>
            <Button onClick={handleUpdateUser} className="bg-blue-600 hover:bg-blue-700">
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
