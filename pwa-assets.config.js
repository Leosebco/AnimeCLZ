import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

/**
 * Genera favicon.ico, apple-touch-icon, íconos PWA (192/512) y el ícono
 * maskable a partir del favicon.svg real ya existente — evita fabricar cada
 * PNG a mano. Correr con `npx pwa-assets-generator` tras cambiar el SVG
 * fuente; los archivos generados quedan en `public/`.
 */
export default defineConfig({
  preset: minimal2023Preset,
  images: ['public/favicon.svg'],
})
