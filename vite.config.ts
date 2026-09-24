import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

import { site } from './src/content/site.ts'

const DEFAULT_SITE_URL = 'https://satyajiit.github.io/SatyajitOS-macOS-Portfolio'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // "/" locally and on custom domains, "/<repo>/" on GitHub Pages project sites.
  const base = env.VITE_BASE || '/'
  // Absolute URL for canonical/OG tags in index.html (%VITE_SITE_URL%).
  process.env.VITE_SITE_URL = (env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '')

  return {
    base,
    plugins: [
      vue(),
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        injectRegister: false,
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'robots.txt'],
        manifest: {
          id: base,
          name: site.title,
          short_name: site.osName,
          description: site.description,
          lang: 'en',
          dir: 'ltr',
          theme_color: site.themeColor,
          background_color: site.backgroundColor,
          display: 'standalone',
          display_override: ['window-controls-overlay', 'standalone'],
          orientation: 'any',
          start_url: base,
          scope: base,
          categories: ['portfolio', 'personalization', 'developer'],
          icons: [
            { src: 'icons/app/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: 'icons/app/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            {
              src: 'icons/app/maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          shortcuts: [
            { name: 'Terminal', url: 'app/terminal', icons: [{ src: 'icons/app/shortcut-terminal.png', sizes: '96x96' }] },
            { name: 'Mail', url: 'app/email', icons: [{ src: 'icons/app/shortcut-mail.png', sizes: '96x96' }] },
            { name: 'Finder', url: 'app/finder', icons: [{ src: 'icons/app/shortcut-finder.png', sizes: '96x96' }] },
          ],
          screenshots: [
            {
              src: 'screenshots/desktop-wide.webp',
              sizes: '1440x900',
              type: 'image/webp',
              form_factor: 'wide',
              label: 'The desktop, with Finder and Terminal open',
            },
            {
              src: 'screenshots/mobile-narrow.webp',
              sizes: '393x852',
              type: 'image/webp',
              form_factor: 'narrow',
              label: 'The home screen on a phone',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2,ico}'],
          // Firebase only loads when analytics is configured, so don't precache it.
          globIgnores: ['screenshots/**', 'og-image.png', 'assets/firebase-*.js'],
          navigateFallback: 'index.html',
          cleanupOutdatedCaches: true,
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      target: 'es2022',
      chunkSizeWarningLimit: 800,
      rolldownOptions: {
        output: {
          // Stable vendor chunks: app changes don't bust the framework/animation caches.
          codeSplitting: {
            groups: [
              { name: 'vue', test: /node_modules[\\/](@vue|vue|vue-router|pinia)[\\/]/ },
              { name: 'motion', test: /node_modules[\\/](motion-v|framer-motion|motion-dom|motion-utils|@vueuse)[\\/]/ },
              // Only downloaded when analytics is configured (see src/lib/analytics.ts).
              { name: 'firebase', test: /node_modules[\\/](firebase|@firebase|idb)[\\/]/ },
            ],
          },
        },
        experimental: {
          // Skip compiling the ~6k unused re-exports in icon barrels like @lucide/vue.
          lazyBarrel: true,
        },
      },
    },
  }
})
