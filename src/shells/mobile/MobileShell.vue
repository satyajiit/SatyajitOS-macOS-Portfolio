<script setup lang="ts">
import { onKeyStroke, useEventListener } from '@vueuse/core'
import { AnimatePresence } from 'motion-v'
import { computed, onMounted, watch } from 'vue'

import wallpaperDark from '@/assets/wallpapers/horizon-dark.webp'
import wallpaperLight from '@/assets/wallpapers/horizon-light.webp'
import { boot, seedNotifications, updateNotification, welcomeBanner } from '@/content/mobile'
import { useAppearanceStore } from '@/stores/appearance'
import { useMobileStore, type InstallPromptEvent } from '@/stores/mobile'
import { useNotificationsStore } from '@/stores/notifications'
import { usePWAStore } from '@/stores/pwa'

import AppContainer from './AppContainer.vue'
import BannerStack from './BannerStack.vue'
import ControlCentre from './ControlCentre.vue'
import HomeScreen from './HomeScreen.vue'
import MobileBoot from './MobileBoot.vue'
import NotificationCentre from './NotificationCentre.vue'
import Spotlight from './Spotlight.vue'
import StatusBar from './StatusBar.vue'
import { useMobileRouting } from './useMobileRouting'

/**
 * The iPhone. Layers, back to front: wallpaper, home screen, foreground app,
 * Search / Control Centre / Notification Centre, banners, status bar, and a
 * brightness veil driven by the Control Centre slider.
 */
const store = useMobileStore()
const appearance = useAppearanceStore()
const notifications = useNotificationsStore()
const pwa = usePWAStore()

const wallpaper = computed(() => (appearance.isDark ? wallpaperDark : wallpaperLight))
const overlayOpen = computed(() => store.panel === 'control' || store.panel === 'notifications')
/** Max 55% dim at zero brightness: dark enough to notice, never a black screen. */
const dim = computed(() => ((100 - store.controls.brightness) / 100) * 0.55)

function seed() {
  if (store.seeded) return
  store.seeded = true
  for (const n of [...seedNotifications].reverse()) {
    const id = notifications.notify({ title: n.title, body: n.body, app: n.app, silent: true })
    const filed = notifications.history.find((item) => item.id === id)
    if (filed) filed.createdAt = Date.now() - n.minutesAgo * 60_000
  }
  setTimeout(() => notifications.notify({ title: welcomeBanner.title, body: welcomeBanner.body }), welcomeBanner.delayMs)
}

onMounted(async () => {
  if (store.isBooting) {
    // `?boot=skip` jumps straight to the home screen (handy for screenshots).
    const skip = new URLSearchParams(window.location.search).get('boot') === 'skip'
    const fast = matchMedia('(prefers-reduced-motion: reduce)').matches
    await store.startBoot(skip ? 1 : fast ? 600 : boot.durationMs)
  }
  seed()
})

useMobileRouting()

watch(
  () => pwa.needRefresh,
  (ready) => {
    if (!ready) return
    notifications.notify({
      title: updateNotification.title,
      body: updateNotification.body,
      app: 'settings',
      duration: 8000,
      actions: [{ label: updateNotification.action, run: () => pwa.refreshApp() }],
    })
  },
  { immediate: true },
)

onKeyStroke('Escape', () => {
  if (store.panel) store.closePanel()
  else if (store.isEditMode) store.exitEditMode()
})

useEventListener(window, 'beforeinstallprompt', (event: Event) => {
  event.preventDefault()
  store.installPrompt = event as InstallPromptEvent
})
useEventListener(window, 'appinstalled', () => (store.installPrompt = null))

</script>

<template>
  <div class="phone fixed inset-0 overflow-clip">
    <MobileBoot v-if="store.isBooting" />

    <template v-else>
      <div class="wallpaper absolute inset-0 bg-cover bg-center" :style="{ backgroundImage: `url(${wallpaper})` }" />

      <HomeScreen :inert="!!store.activeApp || !!store.panel" />
      <AppContainer :inert="!!store.panel" />

      <AnimatePresence>
        <Spotlight v-if="store.panel === 'search'" key="search" />
        <ControlCentre v-else-if="store.panel === 'control'" key="control" />
        <NotificationCentre v-else-if="store.panel === 'notifications'" key="notifications" />
      </AnimatePresence>

      <StatusBar :on-dark="overlayOpen" />
      <BannerStack />

      <div class="veil pointer-events-none absolute inset-0 bg-black" :style="{ opacity: dim }" aria-hidden="true" />
    </template>
  </div>
</template>

<style scoped>
.phone {
  --ios-status-height: max(env(safe-area-inset-top), 47px);
  /* The strip the home-indicator grabber occupies; apps pad their bottom bars by it. */
  --ios-home-indicator-height: calc(max(env(safe-area-inset-bottom), 8px) + 18px);
  background: var(--boot-bg);
  overscroll-behavior: none;
  touch-action: manipulation;
}

.wallpaper {
  transform: scale(1.02);
}

.veil {
  transition: opacity var(--dur-micro) linear;
}
</style>
