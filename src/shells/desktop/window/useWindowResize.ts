import type { AppId } from '@/apps/registry'
import { useWindowsStore, type Rect } from '@/stores/windows'

export type Edge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'
export const EDGES: Edge[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']

/** Resize from any edge or corner. The opposite edge stays pinned. */
export function useWindowResize(id: AppId) {
  const store = useWindowsStore()

  function start(edge: Edge, event: PointerEvent) {
    const win = store.windows[id]
    if (event.button !== 0 || !win) return
    const handle = event.currentTarget as HTMLElement
    handle.setPointerCapture(event.pointerId)
    event.preventDefault()
    event.stopPropagation()
    store.focus(id)

    const origin: Rect = { x: win.x, y: win.y, width: win.width, height: win.height }
    const startX = event.clientX
    const startY = event.clientY
    let frame = 0

    const move = (e: PointerEvent) => {
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      const rect = { ...origin }
      if (edge.includes('e')) rect.width = origin.width + dx
      if (edge.includes('s')) rect.height = origin.height + dy
      if (edge.includes('w')) {
        rect.x = origin.x + dx
        rect.width = origin.width - dx
      }
      if (edge.includes('n')) {
        rect.y = origin.y + dy
        rect.height = origin.height - dy
      }
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0
          store.resize(id, rect)
        })
      }
    }
    const end = () => {
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', end)
      handle.removeEventListener('pointercancel', end)
    }
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', end)
    handle.addEventListener('pointercancel', end)
  }

  return { start }
}
