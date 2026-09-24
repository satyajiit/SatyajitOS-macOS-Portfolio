import { computed, ref } from 'vue'

import { useAnalytics } from './useAnalytics'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

/*
 * Chrome fires `beforeinstallprompt` once, often before the component that
 * wants it has mounted, so the listener lives at module level and the event
 * is kept for whoever asks later.
 */
const deferred = ref<BeforeInstallPromptEvent | null>(null)
const installed = ref(false)
const installing = ref(false)

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}

if (typeof window !== 'undefined') {
  installed.value = detectStandalone()
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferred.value = event as BeforeInstallPromptEvent
  })
  window.addEventListener('appinstalled', () => {
    installed.value = true
    deferred.value = null
  })
}

export type InstallResult = 'accepted' | 'dismissed' | 'manual'

export function usePwaInstall() {
  const { trackPWAInstall } = useAnalytics()

  /** The browser offered a native install prompt we can trigger. */
  const canPrompt = computed(() => !!deferred.value && !installed.value)

  /** Where to look when there is no native prompt (Safari, Firefox, iOS). */
  const manualInstructions = computed(() => {
    const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(ua)) return 'Tap the Share button, then "Add to Home Screen".'
    if (/android/.test(ua)) return 'Open the browser menu and choose "Add to Home screen".'
    if (/safari/.test(ua) && !/chrome|chromium|edg/.test(ua))
      return 'In Safari, choose File > Add to Dock.'
    return "Click the install button in your browser's address bar."
  })

  async function install(): Promise<InstallResult> {
    const event = deferred.value
    if (!event) return 'manual'
    installing.value = true
    try {
      await event.prompt()
      const { outcome } = await event.userChoice
      if (outcome === 'accepted') {
        installed.value = true
        trackPWAInstall()
      }
      return outcome
    } catch {
      return 'manual'
    } finally {
      deferred.value = null
      installing.value = false
    }
  }

  return {
    canPrompt,
    isInstalled: computed(() => installed.value),
    isInstalling: computed(() => installing.value),
    manualInstructions,
    install,
  }
}
