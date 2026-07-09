/**
 * Punto único de entrada de datos de anime para toda la app (v1.3).
 * Ninguna página/componente debe importar un proveedor (Jikan, AniList,
 * TMDB) directamente — siempre importan desde aquí. Hoy delega el 100%
 * en JikanProvider; cambiar el proveedor activo en el futuro es cambiar
 * el import de esta única línea, sin tocar el resto de la app.
 *
 * Proveedores disponibles: `providers/jikan` (activo), `providers/anilist`
 * y `providers/tmdb` (arquitectura preparada, no implementados — ver
 * stubProvider.js).
 */
export * from './jikan/JikanProvider'
