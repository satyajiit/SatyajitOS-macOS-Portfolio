<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import { computed, onMounted, onUnmounted, toRef, watch } from 'vue'

import wallpaperDark from '@/assets/wallpapers/horizon-dark.webp'
import wallpaperLight from '@/assets/wallpapers/horizon-light.webp'
import { welcomeNotifications, pwaCopy } from '@/content/desktop'
import { duration, ease } from '@/design/motion'
import { useAppearanceStore } from '@/stores/appearance'
import { useNotificationsStore } from '@/stores/notifications'
import { usePWAStore } from '@/stores/pwa'
import { useSystemStore } from '@/stores/system'
import { useSystemStatusStore } from '@/stores/systemStatus'

import BootScreen from './BootScreen.vue'
import ControlCenter from './control-center/ControlCenter.vue'
import DesktopIcons from './desktop/DesktopIcons.vue'
import Dock from './dock/Dock.vue'
import MenuBar from './menubar/MenuBar.vue'
import NotificationBanners from './notifications/NotificationBanners.vue'
import NotificationCenter from './notifications/NotificationCenter.vue'
import { closeMenus, shellUi } from './shellUi'
import InstallDialog from './system/InstallDialog.vue'
import SystemOverlay from './system/SystemOverlay.vue'
import { useDesktopRouting } from './useDesktopRouting'
import { useDesktopShortcuts } from './useDesktopShortcuts'
import QuoteWidget from './widgets/QuoteWidget.vue'
import WindowLayer from './window/WindowLayer.vue'

/**
 * The Mac. Boots, then shows the desktop: wallpaper, widget, icons, windows,
 * Dock, menu bar, and whatever panel or power state is up.
 * `?boot=skip` jumps straight to the desktop (handy for screenshots).
 */
const appearance = useAppearanceStore()
const notifications = useNotificationsStore()
const status = useSystemStatusStore()
const system = useSystemStore()
const pwa = usePWAStore()

if (new URLSearchParams(window.location.search).get('boot') === 'skip') shellUi.booted = true
const booted = toRef(shellUi, 'booted')
useDesktopRouting(booted)
useDesktopShortcuts()

const timers: ReturnType<typeof setTimeout>[] = []

function onBooted() {
  booted.value = true
}

watch(
  booted,
  (done) => {
    if (!done || shellUi.welcomed) return
    shellUi.welcomed = true
    for (const n of welcomeNotifications) {
      timers.push(
        setTimeout(
          () =>
            notifications.notify({
              title: n.title,
              body: n.body,
              app: n.app,
              kind: n.kind,
              duration: n.durationMs,
              actions: n.action ? [{ label: n.action.label, openApp: n.action.openApp }] : undefined,
            }),
          n.delayMs,
        ),
      )
    }
  },
  { immediate: true },
)

// The service worker found a new build: offer it the macOS way.
watch(
  () => pwa.needRefresh,
  (need) => {
    if (!need) return
    notifications.notify({
      title: pwaCopy.update.title,
      body: pwaCopy.update.body,
      duration: 0,
      actions: [{ label: pwaCopy.update.action, run: () => void pwa.refreshApp() }],
    })
  },
  { immediate: true },
)
watch(
  () => pwa.offlineReady,
  (ready) => ready && notifications.notify({ ...pwaCopy.offlineReady, silent: false, duration: 4000 }),
)

// Focus modes silence banners.
watch(
  () => status.focusMode,
  (mode) => notifications.setDoNotDisturb(mode !== 'off'),
  { immediate: true },
)

// Nothing interactive should stay open behind a power state.
watch(
  () => system.isNormal,
  (normal) => !normal && closeMenus(),
)

onMounted(() => status.startSimulation())
onUnmounted(() => {
  status.stopSimulation()
  timers.forEach(clearTimeout)
})

const dimming = computed(() => ((100 - status.brightnessLevel) / 100) * 0.7)
const crossfade = { duration: duration.long, ease: ease.out }

function onDesktopPointerDown(event: PointerEvent) {
  if (event.target === event.currentTarget) shellUi.selectedIcon = null
}
</script>

<template>
  <div class="desktop fixed inset-0 overflow-clip">
    <!-- Wallpaper: both layers stay mounted so appearance changes crossfade -->
    <div
      class="wallpaper"
      :style="{ backgroundImage: `url(${wallpaperDark})`, opacity: appearance.isDark ? 1 : 0 }"
      aria-hidden="true"
    />
    <div
      class="wallpaper"
      :style="{ backgroundImage: `url(${wallpaperLight})`, opacity: appearance.isDark ? 0 : 1 }"
      aria-hidden="true"
    />

    <template v-if="booted">
      <div class="surface fixed inset-0" @pointerdown="onDesktopPointerDown" />
      <QuoteWidget v-if="shellUi.showWidgets" />
      <DesktopIcons />
      <WindowLayer />
      <Dock />
      <MenuBar />
      <NotificationBanners />

      <AnimatePresence>
        <motion.div
          v-if="shellUi.openMenu === 'control-center'"
          key="cc"
          class="relative z-(--z-control-center)"
          :initial="{ opacity: 0, y: -6 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0, y: -6, transition: { duration: 0.12 } }"
          :transition="crossfade"
        >
          <ControlCenter />
        </motion.div>
        <motion.div
          v-if="shellUi.openMenu === 'notification-center'"
          key="nc"
          class="relative z-(--z-control-center)"
          :initial="{ opacity: 0, x: 24 }"
          :animate="{ opacity: 1, x: 0 }"
          :exit="{ opacity: 0, x: 24, transition: { duration: 0.14 } }"
          :transition="crossfade"
        >
          <NotificationCenter />
        </motion.div>
      </AnimatePresence>

      <InstallDialog v-if="shellUi.installDialog" />
      <SystemOverlay />
      <div
        v-if="dimming > 0.01"
        class="dimmer pointer-events-none fixed inset-0 bg-black"
        :style="{ opacity: dimming }"
        aria-hidden="true"
      />
    </template>

    <AnimatePresence>
      <motion.div
        v-if="!booted"
        key="boot"
        :initial="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="crossfade"
      >
        <BootScreen @done="onBooted" />
      </motion.div>
    </AnimatePresence>
  </div>
</template>

<style scoped>
.desktop {
  background: var(--wallpaper-fallback);
}
.wallpaper {
  position: fixed;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: opacity var(--dur-long) var(--ease-in-out);
}
.surface {
  z-index: var(--z-wallpaper);
}
.dimmer {
  z-index: calc(var(--z-system) + 1);
}
</style>
