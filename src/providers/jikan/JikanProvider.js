/**
 * Implementación del proveedor de anime para Jikan (API no oficial de
 * MyAnimeList). La lógica real (llamadas a `src/api/jikan.js`, mapeo al
 * modelo canónico, overlay de sinopsis en español) sigue viviendo en
 * `services/animeService.js` — no se movió/reescribió para no arriesgar
 * ese código ya probado; este archivo es la fachada con el nombre que la
 * arquitectura de proveedores espera. Cualquier función nueva de Jikan
 * debe agregarse en animeService.js y quedar re-exportada aquí.
 */
export * from '@/services/animeService'
