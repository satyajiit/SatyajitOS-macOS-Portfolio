/**
 * Gesture maths from Apple's "Designing Fluid Interfaces": momentum
 * projection, rubber-banding past a boundary, and a velocity tracker fed from
 * the last few pointer samples.
 */

/** Where a flick at `velocity` px/s would come to rest (scroll-like deceleration). */
export function project(velocity: number, decelerationRate = 0.998): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate)
}

/** Progressive resistance past a boundary: the further you pull, the less it follows. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
}

export interface VelocityTracker {
  add: (value: number) => void
  /** px per second over the last ~100ms of samples. */
  velocity: () => number
  reset: () => void
}

export function createVelocityTracker(windowMs = 100): VelocityTracker {
  let samples: { t: number; v: number }[] = []
  return {
    add(value) {
      const t = performance.now()
      samples.push({ t, v: value })
      samples = samples.filter((s) => t - s.t <= windowMs)
    },
    velocity() {
      if (samples.length < 2) return 0
      const first = samples[0]!
      const last = samples[samples.length - 1]!
      const dt = last.t - first.t
      return dt > 0 ? ((last.v - first.v) / dt) * 1000 : 0
    },
    reset() {
      samples = []
    },
  }
}
