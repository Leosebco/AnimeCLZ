import {
  searchAnime,
  getAnimeById,
  getAnimeEpisodes,
  getAnimeCharacters,
  getAnimeRelations,
  getAnimeRecommendations,
  getAnimePictures,
} from '@/services/animeService'
import { createEpisode } from '../models'

/**
 * Adaptador de Jikan para el Provider Engine (v1.9, +`getGallery` en v2.0)
 * — implementa el contrato de 7 métodos que `ProviderManager.js` espera de
 * cualquier proveedor (`search/getAnime/getEpisodes/getCharacters/
 * getRelations/getRecommendations/getGallery`). La lógica real de Jikan
 * sigue en
 * `services/animeService.js` (no se tocó, no se arriesga código ya
 * probado) — este archivo solo llama a esas funciones y les agrega
 * `source: 'jikan'` para que `ProviderManager` pueda fusionar resultados
 * de varios proveedores sin perder de dónde vino cada uno.
 *
 * Antes de v1.9 este archivo era `export * from '@/services/animeService'`
 * (21 métodos, re-exportados a `AnimeProvider.js`) — ese re-export se movió
 * directo a `AnimeProvider.js` (ver ese archivo) para que las páginas
 * existentes sigan funcionando exactamente igual mientras este archivo
 * pasa a ser el adaptador del motor nuevo.
 */
export async function search(query, filters, signal) {
  const { data } = await searchAnime(query, filters, signal)
  return data.map((item) => ({ ...item, source: 'jikan' }))
}

export async function getAnime(id, signal) {
  const anime = await getAnimeById(id, signal)
  return anime ? { ...anime, source: 'jikan' } : null
}

export async function getEpisodes(id, options, signal) {
  const { data, pagination } = await getAnimeEpisodes(id, options, signal)
  return { data: data.map((ep) => createEpisode({ ...ep, provider: 'jikan' })), pagination }
}

export async function getCharacters(id, signal) {
  const characters = await getAnimeCharacters(id, signal)
  return characters.map((character) => ({ ...character, source: 'jikan' }))
}

export async function getRelations(id, signal) {
  return getAnimeRelations(id, signal)
}

export async function getRecommendations(id, options, signal) {
  const { data, pagination } = await getAnimeRecommendations(id, options, signal)
  return { data: data.map((item) => ({ ...item, source: 'jikan' })), pagination }
}

export async function getGallery(id, signal) {
  const pictures = await getAnimePictures(id, signal)
  return pictures.map((picture) => ({ ...picture, source: 'jikan' }))
}
