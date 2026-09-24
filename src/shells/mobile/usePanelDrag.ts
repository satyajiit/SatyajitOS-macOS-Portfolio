import { usePreferredReducedMotion, useWindowSize } from '@vueuse/core'
import { animate, useMotionValue } from 'motion-v'

import { spring } from '@/design/motion'

import { createVelocityTracker, project, rubberband } from './gestures'

/**
 * Drag-to-dismiss for the pull-down panels. Pulling up tracks 1:1; pulling
 * down rubber-bands. On release the flick is projected: far enough up and the
 * panel leaves (with the finger's velocity), otherwise it springs back.
 */
export function usePanelDrag(onDismiss: () => void) {
  const y = useMotionValue(0)
  const { height } = useWindowSize()
  const reduced = usePreferredReducedMotion()
  const tracker = createVelocityTracker()
  let start: { y: number; id: number; moved: boolean } | null = null

  function onDown(event: PointerEvent) {
    if (event.button !== 0) return
    start = { y: event.clientY, id: event.pointerId, moved: false }
    tracker.reset()
    tracker.add(event.clientY)
  }

  function onMove(event: PointerEvent) {
    if (!start || event.pointerId !== start.id) return
    const dy = event.clientY - start.y
    if (!start.moved && Math.abs(dy) < 8) return
    if (!start.moved) {
      start.moved = true
      ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
    }
    tracker.add(event.clientY)
    y.set(dy < 0 ? dy : rubberband(dy, height.value))
  }

  /** Returns true when the pointer moved enough to count as a drag, not a tap. */
  function onUp(event: PointerEvent): boolean {
    if (!start || event.pointerId !== start.id) return false
    const moved = start.moved
    start = null
    if (!moved) return false
    const velocity = tracker.velocity()
    if (y.get() + project(velocity) < -height.value * 0.18) {
      if (reduced.value === 'reduce') onDismiss()
      else animate(y, -height.value, { ...spring.momentum, velocity }).then(onDismiss)
    } else {
      animate(y, 0, { ...spring.momentum, velocity })
    }
    return true
  }

  return { y, onDown, onMove, onUp }
}
