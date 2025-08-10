import { supabase } from './supabase'

export interface User {
  id: string
  username: string
  userType: "siswa" | "orangtua" | "guru" | "admin"
  loginTime: string
  name?: string
  class?: string
  studentId?: string
}

export async function getCurrentUser(): Promise<User | null> {
  if (typeof window === "undefined") return null

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return null

    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (error || !userData) return null

    return {
      id: userData.id,
      username: userData.username,
      userType: userData.user_type,
      loginTime: session.user.created_at,
      name: userData.name,
      class: userData.class,
      studentId: userData.nisn,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function authenticateUser(username: string, password: string, userType: string): Promise<User | null> {
  try {
    // First, find the user in our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password) // In production, use proper password hashing
      .eq('user_type', userType)
      .eq('is_active', true)
      .single()

    if (userError || !userData) {
      console.error('Authentication failed:', userError)
      return null
    }

    // Create or sign in with Supabase Auth using the user ID as email
    const email = `${userData.id}@academic.system`
    
    // Try to sign in first
    let { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: userData.id, // Use user ID as password for Supabase Auth
    })

    // If sign in fails, try to sign up
    if (signInError) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: userData.id,
      })
      
      if (signUpError) {
        console.error('Auth signup failed:', signUpError)
        return null
      }
      authData = signUpData
    }

    if (!authData.user) return null

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userData.id)

    return {
      id: userData.id,
      username: userData.username,
      userType: userData.user_type,
      loginTime: new Date().toISOString(),
      name: userData.name,
      class: userData.class,
      studentId: userData.nisn,
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

export async function logout() {
  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Logout error:', error)
  }
}

export function canEdit(userType: string): boolean {
  return userType === "guru" || userType === "admin"
}

export function canViewAll(userType: string): boolean {
  return userType === "admin"
}
