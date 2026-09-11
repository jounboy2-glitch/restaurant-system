import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/types'

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) redirect('/unauthorized')
  return user
}

export function getRoleHomePath(role: UserRole): string {
  const paths: Record<UserRole, string> = {
    owner: '/owner',
    admin: '/manager',
    manager: '/manager',
    waiter: '/waiter',
    kitchen: '/kitchen',
  }
  return paths[role] || '/'
}
