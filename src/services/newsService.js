import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { devError } from '@/utils/logger'

const GENERIC_ERROR = 'No pudimos cargar las noticias. Inténtalo nuevamente.'
const SAVE_ERROR = 'No pudimos guardar la noticia. Inténtalo nuevamente.'
const PAGE_SIZE = 10

const COLUMNS = 'id, title, content, cover_image, author_id, published, created_at, updated_at'

function fromRow(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    coverImage: row.cover_image,
    authorId: row.author_id,
    published: row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Primer módulo con CRUD real del Panel de Administración (v1.0, tabla
 * `news`, migración 0015) — a diferencia de Animes/Temporadas/Episodios/
 * Personajes/Estudios, Noticias es contenido propio de AnimeCLZ, no
 * datos de Jikan, así que sí tiene sentido un CRUD real aquí.
 */
export async function listNews({ page = 1, search = '' } = {}) {
  if (!isSupabaseConfigured) return { data: [], total: 0, page, pageSize: PAGE_SIZE }

  let query = supabase.from('news').select(COLUMNS, { count: 'exact' }).order('created_at', { ascending: false })
  if (search.trim()) query = query.ilike('title', `%${search.trim()}%`)

  const from = (page - 1) * PAGE_SIZE
  const { data, error, count } = await query.range(from, from + PAGE_SIZE - 1)
  if (error) {
    devError('[newsService.listNews] Supabase error:', error)
    throw new Error(GENERIC_ERROR)
  }
  return { data: data.map(fromRow), total: count ?? 0, page, pageSize: PAGE_SIZE }
}

export async function createNews(authorId, { title, content, coverImage, published }) {
  if (!isSupabaseConfigured) throw new Error(SAVE_ERROR)
  const { data, error } = await supabase
    .from('news')
    .insert({ title, content, cover_image: coverImage, published: Boolean(published), author_id: authorId })
    .select(COLUMNS)
    .single()
  if (error) {
    devError('[newsService.createNews] Supabase error:', error)
    throw new Error(SAVE_ERROR)
  }
  return fromRow(data)
}

export async function updateNews(id, { title, content, coverImage, published }) {
  if (!isSupabaseConfigured) throw new Error(SAVE_ERROR)
  const { data, error } = await supabase
    .from('news')
    .update({ title, content, cover_image: coverImage, published })
    .eq('id', id)
    .select(COLUMNS)
    .single()
  if (error) {
    devError('[newsService.updateNews] Supabase error:', error)
    throw new Error(SAVE_ERROR)
  }
  return fromRow(data)
}

export async function deleteNews(id) {
  if (!isSupabaseConfigured) throw new Error(SAVE_ERROR)
  const { error } = await supabase.from('news').delete().eq('id', id)
  if (error) {
    devError('[newsService.deleteNews] Supabase error:', error)
    throw new Error('No pudimos eliminar la noticia. Inténtalo nuevamente.')
  }
}
