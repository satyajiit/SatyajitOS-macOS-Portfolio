import { defineStore } from 'pinia'
import { computed, reactive, ref, shallowRef } from 'vue'

import { getApp, type AppId } from '@/apps/registry'
import { useAnalytics } from '@/composables/useAnalytics'
import { settings } from '@/content/mobile'

export type Panel = 'control' | 'notifications' | 'search'

/** Chromium's install event (not in the DOM typings yet). */
export interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/** Screen-space rectangle an app zooms out of (its home-screen icon). */
export interface LaunchRect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * iPhone shell state: boot, the foreground app, home-screen modes, the
 * pull-down panels and the Control Centre switches. App list and badges come
 * from the registry; this store only tracks what the phone is doing.
 */
export const useMobileStore = defineStore('mobile', () => {
  const { trackAppOpen, trackAppClose } = useAnalytics()

  /* Boot */
  const isBooting = ref(true)
  const bootProgress = ref(0)

  function startBoot(durationMs: number): Promise<void> {
    isBooting.value = true
    bootProgress.value = 0
    const started = performance.now()
    return new Promise((resolve) => {
      const tick = () => {
        const t = Math.min(1, (performance.now() - started) / durationMs)
        // Ease-out so the bar races ahead then settles, like the real one.
        bootProgress.value = Math.round((1 - (1 - t) ** 3) * 100)
        if (t < 1) requestAnimationFrame(tick)
        else {
          isBooting.value = false
          resolve()
        }
      }
      requestAnimationFrame(tick)
    })
  }

  /* Foreground app */
  const activeApp = ref<AppId | null>(null)
  const launchRect = ref<LaunchRect | null>(null)

  function openApp(id: AppId, from?: LaunchRect | null) {
    if (!getApp(id)?.mobile) return
    if (activeApp.value === id) return
    launchRect.value = from ?? null
    activeApp.value = id
    panel.value = null
    isEditMode.value = false
    trackAppOpen(`ios-${id}`)
  }

  function closeApp() {
    if (!activeApp.value) return
    trackAppClose(`ios-${activeApp.value}`)
    activeApp.value = null
  }

  /* Home screen */
  const isEditMode = ref(false)
  const toggleEditMode = () => (isEditMode.value = !isEditMode.value)
  const exitEditMode = () => (isEditMode.value = false)

  /* Pull-down panels and Spotlight: only one at a time */
  const panel = ref<Panel | null>(null)
  const openPanel = (next: Panel) => {
    panel.value = next
    isEditMode.value = false
  }
  const closePanel = () => (panel.value = null)
  const togglePanel = (next: Panel) => (panel.value === next ? closePanel() : openPanel(next))

  /* Control Centre */
  const controls = reactive({
    airplane: false,
    cellular: true,
    wifi: true,
    bluetooth: false,
    orientationLock: false,
    flashlight: false,
    mirroring: false,
    brightness: 80,
    volume: 70,
    productivity: 75,
    caffeine: 60,
    codeQuality: 85,
    procrastinationBlocker: false,
    innovationMode: true,
  })

  // Airplane mode drops every radio and remembers what was on, like iOS.
  let beforeAirplane: { cellular: boolean; wifi: boolean; bluetooth: boolean } | null = null
  function setAirplane(on: boolean) {
    if (on === controls.airplane) return
    controls.airplane = on
    if (on) {
      beforeAirplane = { cellular: controls.cellular, wifi: controls.wifi, bluetooth: controls.bluetooth }
      controls.cellular = false
      controls.wifi = false
      controls.bluetooth = false
    } else {
      Object.assign(controls, beforeAirplane ?? { cellular: true, wifi: true, bluetooth: false })
      beforeAirplane = null
    }
  }

  /* Radios as shown in Settings */
  const joinedNetwork = ref(settings.networks[0]?.name ?? '')
  const bluetoothDevices = reactive(settings.bluetoothDevices.map((device) => ({ ...device })))

  /* Status bar */
  const battery = ref(100)
  const signalBars = computed(() => (controls.airplane || !controls.cellular ? 0 : 4))
  const wifiNetwork = computed(() => (controls.wifi ? joinedNetwork.value : null))

  /** Captured `beforeinstallprompt`, so Settings can offer a real Install button. */
  const installPrompt = shallowRef<InstallPromptEvent | null>(null)

  /** Seed notifications only once per session. */
  const seeded = ref(false)

  return {
    isBooting,
    bootProgress,
    startBoot,
    activeApp,
    launchRect,
    openApp,
    closeApp,
    isEditMode,
    toggleEditMode,
    exitEditMode,
    panel,
    openPanel,
    closePanel,
    togglePanel,
    controls,
    setAirplane,
    joinedNetwork,
    bluetoothDevices,
    battery,
    signalBars,
    wifiNetwork,
    installPrompt,
    seeded,
  }
})
