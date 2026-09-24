import { useIntervalFn, useNow } from '@vueuse/core'
import { computed } from 'vue'

/** Status-bar and lock-screen time, refreshed every few seconds. */
export function useClock() {
  const now = useNow({ scheduler: (tick) => useIntervalFn(tick, 5000) })
  const time = computed(() =>
    now.value.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: false }),
  )
  const date = computed(() =>
    now.value.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' }),
  )
  return { now, time, date }
}

/** "now", "5m ago", "2h ago", then the clock time: how iOS stamps notifications. */
export function relativeTime(then: number, now: number): string {
  const minutes = Math.floor((now - then) / 60000)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(then).toLocaleDateString([], { day: 'numeric', month: 'short' })
}
