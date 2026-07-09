import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const GENERIC_ERROR = 'No pudimos cargar tu perfil. Inténtalo nuevamente.'

export async function getProfile(userId) {
  if (!isSupabaseConfigured || !userId) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('id, user_id, username, avatar, bio, role, created_at, updated_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(GENERIC_ERROR)
  return data
}

export async function updateProfile(userId, updates) {
  if (!isSupabaseConfigured) throw new Error(GENERIC_ERROR)
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select('id, user_id, username, avatar, bio, role, created_at, updated_at')
    .single()
  if (error) throw new Error('No pudimos guardar los cambios de tu perfil. Inténtalo nuevamente.')
  return data
}
