import { computed, onScopeDispose, ref } from 'vue'

/**
 * One shared ticking clock for the whole OS. The interval runs only while at
 * least one component is using it, and ticks on the second boundary so every
 * clock on screen flips at the same moment.
 */
const now = ref(new Date())
let users = 0
let timer: ReturnType<typeof setTimeout> | null = null

function schedule() {
  timer = setTimeout(
    () => {
      now.value = new Date()
      schedule()
    },
    1000 - (Date.now() % 1000),
  )
}

// en-US gives three-letter names ("Sep", not en-GB's "Sept"); the order is macOS's.
const shortParts = new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
function menuDateOf(date: Date) {
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    shortParts.formatToParts(date).find((p) => p.type === type)?.value ?? ''
  return `${part('weekday')} ${part('day')} ${part('month')}`
}
const timeShort = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })
const timeNoPeriod = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})
const longDate = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

export function useClock() {
  users++
  if (!timer) schedule()
  onScopeDispose(() => {
    users--
    if (users === 0 && timer) {
      clearTimeout(timer)
      timer = null
    }
  })

  return {
    now,
    /** Menu-bar style: "Thu 24 Sep" */
    menuDate: computed(() => menuDateOf(now.value)),
    /** "5:06 PM" */
    time: computed(() => timeShort.format(now.value)),
    /** Lock-screen style: "5:06" */
    bigTime: computed(() => timeNoPeriod.format(now.value).replace(/\s?[AP]M$/, '')),
    /** "Thursday 24 September" */
    longDate: computed(() => longDate.format(now.value).replace(',', '')),
  }
}

/** "now", "2m ago", "1h ago": the way notification banners label time. */
export function relativeTime(from: number, to: Date): string {
  const seconds = Math.max(0, Math.round((to.getTime() - from) / 1000))
  if (seconds < 45) return 'now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}
