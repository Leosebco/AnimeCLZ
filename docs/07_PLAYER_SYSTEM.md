# 07 - PLAYER SYSTEM

---

# Introducción

El Player de AnimeCLZ será uno de los módulos más importantes del proyecto.

Su objetivo no es solamente reproducir videos.

Debe convertirse en un sistema completo de visualización de anime.

Debe sentirse incluso mejor que Crunchyroll.

Toda la lógica del reproductor debe estar desacoplada de la interfaz.

La UI únicamente mostrará la información.

Toda la reproducción será administrada mediante PlayerService y PlayerContext.

---

# Objetivos

El reproductor debe permitir:

✔ Reproducir episodios

✔ Cambiar calidad

✔ Cambiar subtítulos

✔ Cambiar servidor

✔ Continuar viendo

✔ Autoplay

✔ Pantalla completa

✔ Picture in Picture

✔ Saltar Opening

✔ Saltar Ending

✔ Recordar volumen

✔ Recordar velocidad

✔ Mini reproductor

✔ Historial automático

✔ Sincronización con el perfil

---

# Arquitectura

Usuario

↓

Watch.jsx

↓

Player.jsx

↓

PlayerContext

↓

PlayerService

↓

ProviderManager

↓

Video Providers

↓

Video

---

# Filosofía

El Player nunca debe conocer de dónde viene el video.

Puede provenir de:

Base Local

Consumet

Enime

AnimePahe

Self Hosted

CDN

Storage

El Player solo recibe:

VideoSource

---

# VideoSource

Todo servidor debe devolver:

{
id,
title,
url,
quality,
language,
provider,
headers,
subtitles
}

Nunca devolver formatos distintos.

---

# Arquitectura del Player

Player

│

├── Controls

├── ProgressBar

├── EpisodeList

├── SubtitleMenu

├── QualityMenu

├── ServerMenu

├── SettingsMenu

├── Volume

├── Fullscreen

├── PictureInPicture

└── SkipButtons

---

# PlayerContext

Responsabilidad

Estado global del reproductor.

Debe almacenar:

video actual

episodio

anime

tiempo actual

duración

volumen

velocidad

calidad

subtítulo

servidor

fullscreen

pip

loading

error

buffer

---

# PlayerService

Responsabilidad

Obtener video.

Guardar progreso.

Cambiar servidor.

Cambiar calidad.

Actualizar historial.

Notificar al Provider.

Nunca renderizar componentes.

---

# Flujo

Usuario

↓

Selecciona episodio

↓

PlayerService

↓

ProviderManager

↓

Servidor

↓

VideoSource

↓

Player

↓

Reproducción

---

# Servidores

Prioridad

1

Base Local

2

Consumet

3

Enime

4

AnimePahe

5

Self Hosted

6

Otros futuros

---

# Calidad

Debe soportar:

360p

480p

720p

1080p

1440p (futuro)

4K (futuro)

Auto

---

# Cambio de calidad

Nunca reiniciar el episodio.

Mantener posición.

---

# Subtítulos

Idiomas

Español

Inglés

Portugués

Japonés

Desactivado

---

# Tipos

ASS

SRT

VTT

---

# Subtítulos

Siempre sincronizados.

Nunca perder tiempo al cambiar idioma.

---

# Audio

Preparado para:

Japonés

Español Latino

Inglés

Portugués

Dual Audio

---

# Velocidad

0.5x

0.75x

1x

1.25x

1.5x

2x

Recordar preferencia.

---

# Volumen

Persistente.

Cada usuario conserva su volumen.

---

# Pantalla Completa

Debe funcionar en:

Desktop

Android

iPhone

PWA

---

# Picture in Picture

Soportar navegadores compatibles.

---

# Mini Player

Cuando el usuario navega:

Continuar reproduciendo.

---

# Continuar viendo

Guardar automáticamente cada:

10 segundos

o

cada cambio importante.

Nunca esperar al final.

---

# Historial

Guardar:

anime

episodio

posición

fecha

duración

provider

---

# Autoplay

Al terminar un episodio:

Cuenta regresiva.

Siguiente episodio.

Cancelar.

---

# Skip Opening

Detectar:

Opening

↓

Mostrar botón

↓

Saltar

---

# Skip Ending

Igual.

---

# Buffer

Mostrar indicador.

Nunca congelar interfaz.

---

# Errores

Si un servidor falla:

↓

Cambiar automáticamente

↓

Siguiente servidor

↓

Mantener posición

---

# Cache

Guardar:

último episodio

último servidor

última calidad

últimos subtítulos

---

# Responsive

Desktop

Tablet

Android

iPhone

TV (futuro)

---

# Touch

Doble toque

Avanzar.

Retroceder.

Pellizcar

Zoom (futuro).

Deslizar

Brillo (futuro).

Volumen (futuro).

---

# Atajos

Espacio

Play

F

Fullscreen

M

Mute

←

Retroceder

→

Avanzar

↑

Volumen +

↓

Volumen -

S

Subtítulos

Q

Calidad

---

# Seguridad

Nunca exponer URLs privadas.

Nunca guardar tokens.

Nunca exponer claves.

---

# Analytics

Registrar:

Inicio.

Fin.

Tiempo visto.

Calidad.

Servidor.

Errores.

Solo para estadísticas.

---

# Claude Rules

Nunca acoplar el Player a un Provider.

Nunca llamar APIs desde Player.

Nunca guardar progreso fuera de PlayerService.

Nunca romper Continue Watching.

Nunca reiniciar reproducción al cambiar calidad.

Siempre mantener la posición del video.

---

# Objetivo Final

El reproductor debe sentirse tan fluido como YouTube, tan elegante como Netflix y tan especializado en anime como Crunchyroll.

Toda la lógica debe permanecer desacoplada para permitir agregar nuevos servidores sin modificar la interfaz.

---

FIN DEL DOCUMENTO

---

## Navegación

**Documentos relacionados:** [06 Provider Manager](06_PROVIDER_MANAGER.md) · [03 Database](03_DATABASE.md) · [13 Performance](13_PERFORMANCE.md)

| Anterior | Índice | Siguiente |
|---|---|---|
| [06 Provider Manager](06_PROVIDER_MANAGER.md) | [INDEX.md](INDEX.md) | [08 Admin Panel](08_ADMIN_PANEL.md) |
