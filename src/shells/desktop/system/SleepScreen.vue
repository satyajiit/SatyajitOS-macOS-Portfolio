<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

import { sleep as copy } from '@/content/system'
import { useNotificationsStore } from '@/stores/notifications'
import { useSystemStore } from '@/stores/system'

/** Display asleep: black. Any key or click wakes it and reports the nap. */
const system = useSystemStore()
const notifications = useNotificationsStore()
const quip = copy.quips[Math.floor(Math.random() * copy.quips.length)]
const elapsed = ref('00:00')
let timer: ReturnType<typeof setInterval> | null = null
let armed = false

async function wake() {
  if (!armed) return
  const seconds = await system.wakeUp()
  notifications.notify({ title: 'Good morning!', body: copy.wokeUp(seconds), kind: 'success' })
}

function tick() {
  const started = system.sleepStartedAt ?? Date.now()
  const s = Math.floor((Date.now() - started) / 1000)
  elapsed.value = `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
}

onMounted(() => {
  timer = setInterval(tick, 1000)
  // Ignore the click that chose "Sleep" from the menu.
  setTimeout(() => (armed = true), 600)
  window.addEventListener('keydown', wake)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
  window.removeEventListener('keydown', wake)
})
</script>

<template>
  <div
    class="sleep fixed inset-0 grid cursor-none place-items-center chrome"
    role="button"
    tabindex="0"
    :aria-label="copy.wakeHint"
    @pointerdown="wake"
  >
    <div class="flex flex-col items-center gap-2 text-center">
      <p class="text-title-3 dim-2">{{ copy.title }}</p>
      <p class="text-body dim-1">{{ quip }}</p>
      <p class="tabular text-callout dim-1">{{ elapsed }}</p>
      <p class="mt-6 text-subheadline dim-1">{{ copy.wakeHint }}</p>
    </div>
  </div>
</template>

<style scoped>
.sleep {
  z-index: var(--z-system);
  background: var(--boot-bg);
  color: var(--boot-fg);
}
/* A display that is "off" should barely glow. */
.dim-2 {
  opacity: 0.3;
}
.dim-1 {
  opacity: 0.18;
}
</style>
