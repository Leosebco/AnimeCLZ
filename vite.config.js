import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'AnimeCLZ',
        short_name: 'AnimeCLZ',
        description: 'AnimeCLZ — descubre, explora y guarda tu anime favorito con datos reales de MyAnimeList.',
        // Background (no Primary) — confirmado con el usuario: la barra de
        // estado/splash se funde con el fondo casi negro de la app en vez
        // de quedar con el azul de acento.
        theme_color: '#07111F',
        background_color: '#07111F',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'es',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Evita que el service worker sirva de forma obsoleta el punto de
        // entrada de una API externa (Jikan) o de Supabase — solo
        // precachea/sirve-mientras-revalida los propios assets estáticos
        // de la build (JS/CSS/imágenes de public/), nunca datos de red.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
})
