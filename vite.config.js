import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  define: { __BUILD__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ')) },
  // Relative paths so the app works from any address (e.g. GitHub Pages /After/).
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'After',
        short_name: 'After',
        description: 'A story for after.',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // The app itself is saved for offline use right away (small, so updates are quick).
        // Paintings are saved as they're fetched; the app fetches them in the background.
        globPatterns: ['**/*.{js,css,html,woff2}', 'icons/*.png'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /\/images\/.*\.(png|jpg)$/,
            handler: 'CacheFirst',
            options: { cacheName: 'illustrations', expiration: { maxEntries: 400 } },
          },
        ],
      },
    }),
  ],
})
