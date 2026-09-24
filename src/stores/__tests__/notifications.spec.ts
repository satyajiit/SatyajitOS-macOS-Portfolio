import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useNotificationsStore } from '../notifications'

describe('notifications store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())

  it('files history and shows a banner that auto-dismisses', () => {
    const store = useNotificationsStore()
    store.notify({ title: 'Hello', body: 'World', duration: 1000 })
    expect(store.history).toHaveLength(1)
    expect(store.banners).toHaveLength(1)
    vi.advanceTimersByTime(1000)
    expect(store.banners).toHaveLength(0)
    expect(store.history).toHaveLength(1)
  })

  it('keeps at most three banners, newest first', () => {
    const store = useNotificationsStore()
    for (const title of ['a', 'b', 'c', 'd']) store.notify({ title, duration: 0 })
    expect(store.banners.map((n) => n.title)).toEqual(['d', 'c', 'b'])
  })

  it('silent and Do Not Disturb skip the banner but keep history', () => {
    const store = useNotificationsStore()
    store.notify({ title: 'quiet', silent: true })
    store.setDoNotDisturb(true)
    store.notify({ title: 'dnd' })
    expect(store.banners).toHaveLength(0)
    expect(store.history.map((n) => n.title)).toEqual(['dnd', 'quiet'])
  })

  it('removes and clears', () => {
    const store = useNotificationsStore()
    const id = store.notify({ title: 'x', duration: 0 })
    store.notify({ title: 'y', duration: 0 })
    store.remove(id)
    expect(store.history.map((n) => n.title)).toEqual(['y'])
    store.clearAll()
    expect(store.history).toHaveLength(0)
    expect(store.banners).toHaveLength(0)
  })
})
