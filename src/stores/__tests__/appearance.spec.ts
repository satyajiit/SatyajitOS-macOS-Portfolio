import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { useAppearanceStore } from '../appearance'

describe('appearance store', () => {
  beforeEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.appearance
    delete document.documentElement.dataset.accent
    setActivePinia(createPinia())
  })

  it('defaults to dark with the blue accent', async () => {
    const store = useAppearanceStore()
    await nextTick()
    expect(store.resolved).toBe('dark')
    expect(document.documentElement.dataset.appearance).toBe('dark')
    expect(document.documentElement.dataset.accent).toBeUndefined()
  })

  it('writes appearance and accent to <html> and persists them', async () => {
    const store = useAppearanceStore()
    store.setMode('light')
    store.setAccent('purple')
    await nextTick()
    expect(document.documentElement.dataset.appearance).toBe('light')
    expect(document.documentElement.dataset.accent).toBe('purple')
    expect(JSON.parse(localStorage.getItem('satyajitos:appearance')!)).toEqual({
      mode: 'light',
      accent: 'purple',
    })
  })

  it('restores a saved choice and ignores junk', () => {
    localStorage.setItem('satyajitos:appearance', JSON.stringify({ mode: 'light', accent: 'nope' }))
    const store = useAppearanceStore()
    expect(store.mode).toBe('light')
    expect(store.accent).toBe('blue')
  })

  it('toggles between light and dark', () => {
    const store = useAppearanceStore()
    store.toggleDark()
    expect(store.resolved).toBe('light')
    store.toggleDark()
    expect(store.resolved).toBe('dark')
  })
})
