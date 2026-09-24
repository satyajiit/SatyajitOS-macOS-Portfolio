import { usePreferredDark } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref, watch, watchEffect } from 'vue'

export type AppearanceMode = 'light' | 'dark' | 'auto'
export type AccentColor =
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'graphite'

export const ACCENTS: AccentColor[] = [
  'blue',
  'purple',
  'pink',
  'red',
  'orange',
  'yellow',
  'green',
  'graphite',
]

/** Shared with the inline script in index.html, which applies it before first paint. */
const STORAGE_KEY = 'satyajitos:appearance'

interface Saved {
  mode: AppearanceMode
  accent: AccentColor
}

function load(): Saved {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<Saved> | null
    return {
      mode: raw?.mode === 'light' || raw?.mode === 'auto' ? raw.mode : 'dark',
      accent: raw?.accent && ACCENTS.includes(raw.accent) ? raw.accent : 'blue',
    }
  } catch {
    return { mode: 'dark', accent: 'blue' }
  }
}

/**
 * System Settings → Appearance. Owns <html data-appearance> and
 * <html data-accent>; every colour token in src/design keys off those two.
 */
export const useAppearanceStore = defineStore('appearance', () => {
  const saved = load()
  const mode = ref<AppearanceMode>(saved.mode)
  const accent = ref<AccentColor>(saved.accent)
  const prefersDark = usePreferredDark()

  const resolved = computed<'light' | 'dark'>(() =>
    mode.value === 'auto' ? (prefersDark.value ? 'dark' : 'light') : mode.value,
  )
  const isDark = computed(() => resolved.value === 'dark')

  watchEffect(() => {
    const root = document.documentElement
    root.dataset.appearance = resolved.value
    if (accent.value === 'blue') delete root.dataset.accent
    else root.dataset.accent = accent.value
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', isDark.value ? '#000000' : '#f2f2f7')
  })

  watch([mode, accent], () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode: mode.value, accent: accent.value }))
    } catch {
      // Private mode or storage disabled: the choice just won't persist.
    }
  })

  const setMode = (next: AppearanceMode) => (mode.value = next)
  const setAccent = (next: AccentColor) => (accent.value = next)
  const toggleDark = () => (mode.value = isDark.value ? 'light' : 'dark')

  return { mode, accent, resolved, isDark, setMode, setAccent, toggleDark }
})
