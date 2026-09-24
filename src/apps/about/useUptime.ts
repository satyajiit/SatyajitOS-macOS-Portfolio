import { onMounted, onUnmounted, ref } from 'vue'

import { codingSince } from '@/content/about'

const DAY = 86_400_000
const YEAR = DAY * 365

/** "8y 267d 16h" since the first line of code, ticking once a minute. */
export function useUptime() {
  const uptime = ref('')
  const lastUpdated = ref('')
  let timer: ReturnType<typeof setInterval> | undefined

  const tick = () => {
    const diff = Date.now() - new Date(codingSince).getTime()
    const years = Math.floor(diff / YEAR)
    const days = Math.floor((diff % YEAR) / DAY)
    const hours = Math.floor((diff % DAY) / 3_600_000)
    uptime.value = `${years}y ${days}d ${hours}h`
    lastUpdated.value = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  tick()
  onMounted(() => (timer = setInterval(tick, 60_000)))
  onUnmounted(() => clearInterval(timer))

  return { uptime, lastUpdated }
}
