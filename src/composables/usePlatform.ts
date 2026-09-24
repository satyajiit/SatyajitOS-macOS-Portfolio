import { useMediaQuery, useWindowSize } from '@vueuse/core'
import { computed, ref } from 'vue'

export type Shell = 'desktop' | 'mobile'

/**
 * Picks which OS to boot. Phones and portrait tablets get the iPhone shell,
 * everything else gets the Mac. `?shell=mobile` or `?shell=desktop` forces
 * one, which is handy for screenshots or for seeing the phone UI on a laptop.
 */
const forced = ref<Shell | null>(readForced())

function readForced(): Shell | null {
  if (typeof window === 'undefined') return null
  const value = new URLSearchParams(window.location.search).get('shell')
  return value === 'mobile' || value === 'desktop' ? value : null
}

export function usePlatform() {
  const { width, height } = useWindowSize()
  const coarse = useMediaQuery('(pointer: coarse)')
  const standalone = useMediaQuery('(display-mode: standalone)')

  const shell = computed<Shell>(() => {
    if (forced.value) return forced.value
    if (width.value < 768) return 'mobile'
    if (coarse.value && width.value < height.value) return 'mobile'
    return 'desktop'
  })

  return {
    shell,
    isMobile: computed(() => shell.value === 'mobile'),
    isDesktop: computed(() => shell.value === 'desktop'),
    isStandalone: standalone,
    isTouch: coarse,
    width,
    height,
    forceShell: (next: Shell | null) => (forced.value = next),
  }
}
