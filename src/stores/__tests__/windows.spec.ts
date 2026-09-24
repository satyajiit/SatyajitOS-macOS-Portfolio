import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { MENUBAR_HEIGHT, useWindowsStore, workArea } from '../windows'

describe('windows store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    window.innerWidth = 1440
    window.innerHeight = 900
  })

  it('opens a window centred in the work area and makes it key', () => {
    const store = useWindowsStore()
    store.open('finder')
    const win = store.windows.finder!
    expect(win.isOpen).toBe(true)
    expect(store.focusedId).toBe('finder')
    expect(win.y).toBeGreaterThanOrEqual(MENUBAR_HEIGHT)
    expect(win.x + win.width / 2).toBeCloseTo(1440 / 2, -1)
  })

  it('ignores apps that have no desktop version', () => {
    const store = useWindowsStore()
    store.open('settings')
    expect(store.windows.settings).toBeUndefined()
  })

  it('brings the most recently focused window to the front', () => {
    const store = useWindowsStore()
    store.open('finder')
    store.open('terminal')
    expect(store.focusedId).toBe('terminal')
    store.focus('finder')
    expect(store.focusedId).toBe('finder')
    expect(store.windows.finder!.zIndex).toBeGreaterThan(store.windows.terminal!.zIndex)
  })

  it('hands focus to the next window when the key window is minimised or closed', () => {
    const store = useWindowsStore()
    store.open('finder')
    store.open('terminal')
    store.minimize('terminal')
    expect(store.focusedId).toBe('finder')
    store.close('finder')
    expect(store.focusedId).toBeNull()
    store.open('terminal')
    expect(store.windows.terminal!.isMinimized).toBe(false)
    expect(store.focusedId).toBe('terminal')
  })

  it('zooms to the work area and restores the previous frame', () => {
    const store = useWindowsStore()
    store.open('email')
    const before = { ...store.windows.email! }
    store.toggleZoom('email')
    expect(store.windows.email!).toMatchObject({ ...workArea(), isZoomed: true })
    store.toggleZoom('email')
    expect(store.windows.email!).toMatchObject({
      x: before.x,
      y: before.y,
      width: before.width,
      height: before.height,
      isZoomed: false,
    })
  })

  it('never lets a window hide under the menu bar or leave the screen', () => {
    const store = useWindowsStore()
    store.open('terminal')
    store.move('terminal', -5000, -5000)
    const win = store.windows.terminal!
    expect(win.y).toBe(MENUBAR_HEIGHT)
    expect(win.x + win.width).toBeGreaterThan(0)
    store.move('terminal', 99999, 99999)
    expect(win.x).toBeLessThan(1440)
    expect(win.y).toBeLessThan(900)
  })

  it('respects the minimum size and pins the opposite edge', () => {
    const store = useWindowsStore()
    store.open('terminal')
    const win = store.windows.terminal!
    const right = win.x + win.width
    store.resize('terminal', { x: win.x + 2000, y: win.y, width: win.width - 2000, height: win.height })
    expect(win.width).toBe(520)
    expect(win.x + win.width).toBe(right)
  })
})
