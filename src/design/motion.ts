/**
 * Motion tokens for motion-v. CSS transitions use the easing/duration tokens
 * in theme.css and tokens.css; anything a user can touch or interrupt uses a
 * spring from here.
 *
 * Springs are critically damped (bounce: 0) by default. Bounce is reserved
 * for motion that follows a physical gesture with momentum (a flick, a drag
 * release), per Apple's "Designing Fluid Interfaces".
 */

export const spring = {
  /** Default UI spring: windows opening, menus, sheets settling. */
  default: { type: 'spring', bounce: 0, duration: 0.4 },
  /** Small, quick state changes: toggles, selection, badges. */
  snappy: { type: 'spring', bounce: 0, duration: 0.25 },
  /** Large surfaces: full-screen overlays, lock screen. */
  gentle: { type: 'spring', bounce: 0, duration: 0.55 },
  /** Only after a gesture that carried momentum (flick to dismiss, drag release). */
  momentum: { type: 'spring', bounce: 0.2, duration: 0.4 },
  /** Dock magnification follows the pointer 1:1, so it must settle fast. */
  dock: { type: 'spring', bounce: 0, duration: 0.2 },
} as const

export const ease = {
  out: [0.16, 1, 0.3, 1],
  in: [0.7, 0, 0.84, 0],
  inOut: [0.65, 0, 0.35, 1],
} as const

/** Seconds, for motion-v `transition.duration`. Exits run at ~75% of enters. */
export const duration = {
  micro: 0.12,
  short: 0.22,
  long: 0.42,
} as const

export const exit = (seconds: number) => seconds * 0.75
