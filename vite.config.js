import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['logo.svg','favicon.svg'],
    manifest: {
      name: 'RakTrack',
      short_name: 'RakTrack',
      description: 'RakTrack — Spare Part & Inventory Tracker QR Rack - 3 segmen EL-A-B01',
      theme_color: '#256B8C',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/',
      icons: [{ src: 'logo.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' }]
    },
    workbox: {
      runtimeCaching: [
        { urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/, handler: 'NetworkFirst', options: { cacheName: 'firestore', expiration: { maxEntries: 50, maxAgeSeconds: 60*5 } } }
      ]
    }
  })],
})
