import type { Ref } from 'vue'

import type { AppId } from '@/apps/registry'
import { useWindowsStore } from '@/stores/windows'

const NO_DRAG = 'button, a, input, textarea, select, [role="button"], [contenteditable], [data-no-drag]'

/**
 * Drag a window by any element marked `data-drag-region`. Tracks the pointer
 * 1:1 from where it was grabbed (no snapping to the corner), keeps tracking
 * outside the window via pointer capture, and double-click zooms.
 */
export function useWindowDrag(id: AppId, root: Ref<HTMLElement | null>) {
  const store = useWindowsStore()
  let grab: { dx: number; dy: number; pointerId: number } | null = null
  let frame = 0
  let next: { x: number; y: number } | null = null

  function isDragTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false
    if (target.closest(NO_DRAG)) return false
    const region = target.closest('[data-drag-region]')
    return !!region && !!root.value?.contains(region)
  }

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0 || !isDragTarget(event.target)) return
    const win = store.windows[id]
    if (!win || !root.value) return
    grab = { dx: event.clientX - win.x, dy: event.clientY - win.y, pointerId: event.pointerId }
    root.value.setPointerCapture(event.pointerId)
    root.value.dataset.dragging = ''
    event.preventDefault()
  }

  function onPointerMove(event: PointerEvent) {
    if (!grab || event.pointerId !== grab.pointerId) return
    next = { x: event.clientX - grab.dx, y: event.clientY - grab.dy }
    if (!frame) {
      frame = requestAnimationFrame(() => {
        frame = 0
        if (next) store.move(id, next.x, next.y)
      })
    }
  }

  function onPointerUp(event: PointerEvent) {
    if (!grab || event.pointerId !== grab.pointerId) return
    root.value?.releasePointerCapture(event.pointerId)
    if (root.value) delete root.value.dataset.dragging
    grab = null
  }

  function onDoubleClick(event: MouseEvent) {
    if (isDragTarget(event.target)) store.toggleZoom(id)
  }

  return { onPointerDown, onPointerMove, onPointerUp, onDoubleClick }
}
