import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
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
        // The app and all its paintings are saved for offline use when it's first opened.
        globPatterns: ['**/*.{js,css,html,woff2}', 'icons/*.png', 'images/*.jpg'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
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
