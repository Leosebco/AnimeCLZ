import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Only the publishable (anon) key ever ships to the frontend — RLS policies
// on every table are what actually restrict access per user, not this key.
// The Secret Key must never be imported here or anywhere under src/.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase no está configurado: define VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en tu .env (ver .env.example). La autenticación y los datos persistentes no funcionarán hasta entonces.',
  )
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
