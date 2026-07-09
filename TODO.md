# TODO - AnimeCLZ

## Prioridad Alta

- [x] Cambiar completamente la identidad visual de StreamFlix a AnimeCLZ.
- [x] Crear el nuevo Hero conectado a datos reales.
- [x] Cambiar favicon. (color corregido en Sprint 3.6 — seguía en rojo desde el Sprint 2)
- [ ] Crear logo oficial AnimeCLZ. (favicon es una marca mínima en SVG; falta un logo completo)
- [x] Eliminar todos los datos mock.
- [x] Unificar el modelo de datos de Anime.
- [x] Mejorar Home.

---

## Sprint 2

- [x] Buscador.
- [x] Explorar.
- [x] Temporada Actual.
- [x] Géneros.
- [x] Skeleton Loading.
- [x] Estados Vacíos.
- [x] Manejo de errores.
- [x] Responsive.

---

## Sprint 3

- [x] Página Detalle Anime. (reconstruida por completo: banner, título japonés, ranking, popularidad, estado, temporada, clasificación, géneros/temas/demografía)
- [x] Trailer. (embed real o estado "sin trailer disponible")
- [ ] Episodios. (Jikan no da streaming; sin reproductor propio, un listado sin nada que reproducir no aporta valor todavía — se retoma con la fase "Streaming")
- [x] Recomendados. (carrusel por anime, reutilizando MovieRow/AnimeCard)
- [x] Relacionados. (precuelas/secuelas/spin-off/OVA/películas/especiales, agrupados)
- [x] Personajes. (principales + actor de voz japonés)
- [x] Estudios. (dentro de la sección Información, junto a productores y licenciantes)

---

## Sprint 3.5

- [x] Arreglar el buscador. (causa real: `order_by`/`sort` forzado en toda búsqueda por texto — quitado; retry con backoff exponencial; mensaje de error amable)
- [x] Rediseño completo — nueva paleta sin rojo (azul suave), Navbar/Hero/Cards/Carruseles/Botones/Formularios.

---

## Sprint 3.6

- [x] Arreglar el buscador (segunda pasada). Causa real: endpoint de búsqueda de Jikan es más frágil que el resto de la API (confirmado con `curl` fuera de la app, varias veces). Mitigado con cola de concurrencia global + más reintentos; no es 100% eliminable (limitación externa).
- [x] Reemplazar todos los `<select>` nativos por un componente `Select` propio (Headless UI Listbox).
- [x] Quitar "MyAnimeList" de todo texto visible al usuario.
- [x] Favicon/logo sin rojo.
- [x] Quitar el botón "Ver detalles" de la card; hover con solo íconos, sin cajas.
- [x] Microanimaciones (transición de página, aparición/desaparición de resultados, duración 180-300ms en todo el sitio).
- [x] Skeleton con shimmer.
- [x] Ajuste de espaciado (menos vacío que el Sprint 3.5).
- [x] Revisión general de consistencia (radios, duraciones).
- [x] `eslint.config.js` (no existía desde el inicio del proyecto) + limpieza de lo que encontró.

---

## Sprint 4

- [ ] Firebase.
- [ ] Login.
- [ ] Registro.
- [ ] Perfil.
- [ ] Configuración.

---

## Sprint 5

- [x] Favoritos. (adelantado desde Sprint 2 — `FavoritesContext` sobre localStorage)
- [x] Mi Lista. (adelantado desde Sprint 2 — página `/mi-lista` funcional)
- [ ] Historial.
- [ ] Continuar Viendo.

---

## Sprint 6

- [ ] Panel Administrador.
- [ ] CRUD Anime.
- [ ] CRUD Episodios.
- [ ] Dashboard.
- [ ] Comentarios.
- [ ] Reportes.

---

## AnimeCLZ Studio

- [ ] Crear Anime Original.
- [ ] Subir portada.
- [ ] Subir banner.
- [ ] Subir episodios.
- [ ] Editor de sinopsis.
- [ ] Editor de géneros.
- [ ] Publicar.
- [ ] Borrador.

---

## Streaming

- [ ] Reproductor.
- [ ] Pantalla completa.
- [ ] Subtítulos.
- [ ] Calidad.
- [ ] Autoplay.
- [ ] Siguiente episodio.
