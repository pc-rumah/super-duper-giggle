export interface User {
  username: string
  userType: "siswa" | "orangtua" | "guru" | "admin"
  loginTime: string
  name?: string
  class?: string
  studentId?: string
}

export const demoUsers = {
  // Siswa
  siswa123: {
    password: "siswa123",
    userType: "siswa" as const,
    name: "Ahmad Rizki",
    class: "7A",
    studentId: "1234567890",
  },
  // Orang Tua
  orangtua123: {
    password: "orangtua123",
    userType: "orangtua" as const,
    name: "Budi Santoso",
    studentName: "Ahmad Rizki",
    studentClass: "7A",
  },
  // Guru
  guru123: {
    password: "guru123",
    userType: "guru" as const,
    name: "Siti Nurhaliza, S.Pd",
    subject: "Matematika",
  },
  // Admin
  admin123: {
    password: "admin123",
    userType: "admin" as const,
    name: "Drs. H. Ahmad Suryadi, M.Pd",
    position: "Kepala Sekolah",
  },
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  const userData = localStorage.getItem("user")
  if (!userData) return null

  try {
    return JSON.parse(userData)
  } catch {
    return null
  }
}

export function authenticateUser(username: string, password: string, userType: string): User | null {
  // Check system users first
  const systemUsers = localStorage.getItem("system-users")
  if (systemUsers) {
    const users = JSON.parse(systemUsers)
    const user = users.find(
      (u: any) => u.username === username && u.password === password && u.userType === userType && u.isActive,
    )

    if (user) {
      // Update last login
      const updatedUsers = users.map((u: any) => (u.id === user.id ? { ...u, lastLogin: new Date().toISOString() } : u))
      localStorage.setItem("system-users", JSON.stringify(updatedUsers))

      return {
        username: user.username,
        userType: user.userType,
        loginTime: new Date().toISOString(),
        name: user.studentName,
        class: user.studentClass,
        studentId: user.nisn,
      }
    }
  }

  // Fallback to demo users
  const demoUserKey = username as keyof typeof demoUsers
  const demoUser = demoUsers[demoUserKey]

  if (demoUser && demoUser.password === password && demoUser.userType === userType) {
    return {
      username,
      userType: demoUser.userType,
      loginTime: new Date().toISOString(),
      name: demoUser.name,
      class: "class" in demoUser ? demoUser.class : undefined,
      studentId: "studentId" in demoUser ? demoUser.studentId : undefined,
    }
  }

  return null
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user")
  }
}

export function canEdit(userType: string): boolean {
  return userType === "guru" || userType === "admin"
}

export function canViewAll(userType: string): boolean {
  return userType === "admin"
}
