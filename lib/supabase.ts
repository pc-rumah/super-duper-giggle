import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  username: string
  password: string
  user_type: 'siswa' | 'orangtua' | 'guru' | 'admin'
  name: string
  nisn?: string
  class?: string
  parent_name?: string
  subject?: string
  position?: string
  is_active: boolean
  created_at: string
  last_login?: string
}

export interface Student {
  id: string
  user_id: string
  name: string
  nisn: string
  class: string
  email?: string
  phone?: string
  address?: string
  parent_user_id?: string
  created_at: string
}

export interface Subject {
  id: string
  name: string
  code: string
  kkm: number
  teacher_user_id: string
  semester: string
  credits: number
  category: 'wajib' | 'pilihan'
  created_at: string
}

export interface GradeUtsUas {
  id: string
  student_id: string
  subject_id: string
  uts_score?: number
  uas_score?: number
  created_at: string
}

export interface GradeDaily {
  id: string
  student_id: string
  subject_id: string
  category_name: string
  score?: number
  created_at: string
}

export interface Attendance {
  id: string
  student_id: string
  date: string
  status: 'present' | 'sick' | 'permission' | 'absent'
}

export interface ExtracurricularActivity {
  id: string
  name: string
}

export interface StudentExtracurricular {
  student_id: string
  activity_id: string
}

export interface ParentChecklist {
  id: string
  parent_user_id: string
  item_id: string
  is_checked: boolean
  last_updated: string
}