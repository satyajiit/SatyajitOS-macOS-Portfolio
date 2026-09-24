import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'

import { getApp, type AppId } from '@/apps/registry'
import { useAnalytics } from '@/composables/useAnalytics'

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface WindowState extends Rect {
  id: AppId
  isOpen: boolean
  isMinimized: boolean
  isZoomed: boolean
  zIndex: number
  /** Frame to return to when un-zooming. */
  restoreRect: Rect | null
}

/** Space the menu bar takes at the top, and the dock keeps free at the bottom. */
export const MENUBAR_HEIGHT = 28
export const DOCK_RESERVE = 86
/** How much of a window must stay on screen so it can always be dragged back. */
const MIN_VISIBLE = 96
const CASCADE = 26

function viewport() {
  if (typeof window === 'undefined') return { width: 1440, height: 900 }
  return { width: window.innerWidth, height: window.innerHeight }
}

/** The area a zoomed window fills: below the menu bar, above the dock. */
export function workArea(): Rect {
  const { width, height } = viewport()
  return { x: 0, y: MENUBAR_HEIGHT, width, height: height - MENUBAR_HEIGHT - DOCK_RESERVE }
}

export const useWindowsStore = defineStore('windows', () => {
  const windows = reactive<Partial<Record<AppId, WindowState>>>({})
  const topZ = ref(100)
  const { trackAppOpen, trackAppClose } = useAnalytics()

  const openWindows = computed(() =>
    Object.values(windows).filter((w): w is WindowState => !!w && w.isOpen),
  )

  /** The key window: frontmost open, un-minimized window. */
  const focusedId = computed<AppId | null>(() => {
    let best: WindowState | null = null
    for (const w of openWindows.value) {
      if (!w.isMinimized && (!best || w.zIndex > best.zIndex)) best = w
    }
    return best?.id ?? null
  })

  function clampToScreen(win: Pick<Rect, 'x' | 'y' | 'width'>): Pick<Rect, 'x' | 'y'> {
    const { width, height } = viewport()
    return {
      x: Math.min(Math.max(win.x, MIN_VISIBLE - win.width), width - MIN_VISIBLE),
      y: Math.min(Math.max(win.y, MENUBAR_HEIGHT), height - MIN_VISIBLE),
    }
  }

  function initialRect(id: AppId): Rect {
    const spec = getApp(id)?.desktop
    const area = workArea()
    const width = Math.min(spec?.width ?? 640, area.width - 32)
    const height = Math.min(spec?.height ?? 480, area.height - 16)
    const cascade = (openWindows.value.length % 6) * CASCADE
    return {
      width,
      height,
      x: Math.round(area.x + (area.width - width) / 2 + cascade),
      y: Math.round(area.y + Math.max(8, (area.height - height) / 2.4) + cascade),
    }
  }

  function focus(id: AppId) {
    const win = windows[id]
    if (!win) return
    if (win.zIndex !== topZ.value) win.zIndex = ++topZ.value
  }

  function open(id: AppId) {
    if (!getApp(id)?.desktop) return
    let win = windows[id]
    if (!win) {
      win = {
        id,
        ...initialRect(id),
        isOpen: true,
        isMinimized: false,
        isZoomed: false,
        zIndex: ++topZ.value,
        restoreRect: null,
      }
      windows[id] = win
    } else {
      if (!win.isOpen) Object.assign(win, initialRect(id), { isZoomed: false, restoreRect: null })
      win.isOpen = true
      win.isMinimized = false
      win.zIndex = ++topZ.value
    }
    trackAppOpen(id)
  }

  function close(id: AppId) {
    const win = windows[id]
    if (!win?.isOpen) return
    win.isOpen = false
    win.isMinimized = false
    trackAppClose(id)
  }

  function minimize(id: AppId) {
    const win = windows[id]
    if (win?.isOpen) win.isMinimized = true
  }

  /** Green button: fill the work area, or go back to the previous frame. */
  function toggleZoom(id: AppId) {
    const win = windows[id]
    if (!win?.isOpen) return
    if (win.isZoomed && win.restoreRect) {
      Object.assign(win, win.restoreRect)
      win.restoreRect = null
      win.isZoomed = false
    } else {
      win.restoreRect = { x: win.x, y: win.y, width: win.width, height: win.height }
      Object.assign(win, workArea())
      win.isZoomed = true
    }
    focus(id)
  }

  function move(id: AppId, x: number, y: number) {
    const win = windows[id]
    if (!win) return
    Object.assign(win, clampToScreen({ x, y, width: win.width }))
    win.isZoomed = false
  }

  function resize(id: AppId, rect: Rect) {
    const win = windows[id]
    const spec = getApp(id)?.desktop
    if (!win || !spec) return
    const width = Math.max(spec.minWidth, rect.width)
    const height = Math.max(spec.minHeight, rect.height)
    // When clamped against the min size while dragging a left/top edge, keep the
    // opposite edge fixed instead of letting the window slide.
    const x = rect.width < spec.minWidth ? rect.x + rect.width - width : rect.x
    const y = rect.height < spec.minHeight ? rect.y + rect.height - height : rect.y
    Object.assign(win, { width, height, ...clampToScreen({ x, y, width }) })
    win.isZoomed = false
  }

  /** Keep every window reachable after the browser window shrinks. */
  function fitToViewport() {
    const area = workArea()
    for (const win of openWindows.value) {
      if (win.isZoomed) Object.assign(win, area)
      else Object.assign(win, clampToScreen(win))
    }
  }

  const isOpen = (id: AppId) => !!windows[id]?.isOpen

  return {
    windows,
    openWindows,
    focusedId,
    open,
    close,
    minimize,
    toggleZoom,
    focus,
    move,
    resize,
    fitToViewport,
    isOpen,
  }
})
