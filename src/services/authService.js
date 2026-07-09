import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const NOT_CONFIGURED_MESSAGE =
  'El inicio de sesión no está disponible en este momento. Inténtalo más tarde.'

// Supabase Auth devuelve mensajes técnicos en inglés — se traducen los más
// comunes a un texto amable en español; el resto cae a un mensaje genérico
// (mismo criterio que los errores de Jikan: nunca texto técnico crudo).
const ERROR_MESSAGES = {
  'Invalid login credentials': 'Correo o contraseña incorrectos.',
  'Email not confirmed': 'Confirma tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.',
  'User already registered': 'Ya existe una cuenta con este correo.',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
  'Unable to validate email address: invalid format': 'El correo ingresado no es válido.',
  'Email rate limit exceeded': 'Demasiados intentos. Espera unos minutos antes de volver a intentarlo.',
}

function friendlyAuthError(error) {
  if (!error) return null
  const message = ERROR_MESSAGES[error.message] || 'Ocurrió un problema. Inténtalo nuevamente.'
  return new Error(message)
}

function assertConfigured() {
  if (!isSupabaseConfigured) throw new Error(NOT_CONFIGURED_MESSAGE)
}

export async function signUpWithEmail({ email, password, username }) {
  assertConfigured()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: username ? { username } : undefined },
  })
  if (error) throw friendlyAuthError(error)
  return data
}

export async function signInWithEmail({ email, password }) {
  assertConfigured()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw friendlyAuthError(error)
  return data
}

export async function signInWithGoogle() {
  assertConfigured()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
  if (error) throw friendlyAuthError(error)
  return data
}

export async function signOut() {
  assertConfigured()
  const { error } = await supabase.auth.signOut()
  if (error) throw friendlyAuthError(error)
}

export async function sendPasswordReset(email) {
  assertConfigured()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/restablecer-contrasena`,
  })
  if (error) throw friendlyAuthError(error)
}

export async function updatePassword(newPassword) {
  assertConfigured()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw friendlyAuthError(error)
}

export async function getSession() {
  if (!isSupabaseConfigured) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured) return { data: { subscription: { unsubscribe() {} } } }
  return supabase.auth.onAuthStateChange(callback)
}
