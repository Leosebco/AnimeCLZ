/**
 * Punto único de entrada de datos de anime para las páginas de catálogo
 * (v1.3). Ninguna página/componente debe importar `services/animeService.js`
 * directamente — siempre importan desde aquí. Delega el 100% en Jikan, sin
 * cambios de comportamiento.
 *
 * **v1.9 — nota importante, no confundir con el Provider Engine:** hasta
 * v1.9 esto re-exportaba `providers/jikan/JikanProvider.js` (que a su vez
 * solo re-exportaba `animeService.js`, sin transformar nada). Ese archivo
 * ahora es el adaptador de Jikan del nuevo `ProviderManager.js` (motor
 * multi-proveedor, AniList+Jikan, ver ese archivo) — expone una interfaz
 * de 6 métodos, no los 21 que esta fachada necesita. Por eso este import
 * apunta directo a `animeService.js`, saltando ese salto intermedio:
 * mismos 21 nombres, mismo comportamiento byte-idéntico, cero riesgo para
 * las páginas que ya consumen `AnimeProvider.js`. `ProviderManager.js` es
 * una ruta nueva y aislada — **ninguna página se conectó a él todavía**;
 * ver CLAUDE.md para el detalle de por qué coexisten ambas rutas.
 */
export * from '@/services/animeService'
