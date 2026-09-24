<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { boot } from '@/content/system'
import UiProgress from '@/ui/UiProgress.vue'

import BrandGlyph from './BrandGlyph.vue'

/**
 * Startup: black screen, white mark, a thin bar. Like a Mac, it says nothing.
 * Any click or key skips it.
 */
const emit = defineEmits<{ done: [] }>()

const reduced = usePreferredReducedMotion()
const duration = computed(() => (reduced.value === 'reduce' ? 900 : boot.durationMs))
const progress = ref(0)
const label = computed(() => {
  const i = Math.min(boot.messages.length - 1, Math.floor((progress.value / 100) * boot.messages.length))
  return boot.messages[i] ?? 'Starting up'
})

let frame = 0
let start = 0
let finished = false

function finish() {
  if (finished) return
  finished = true
  cancelAnimationFrame(frame)
  progress.value = 100
  emit('done')
}

// A Mac's bar doesn't fill linearly: it lurches, pauses, then races the end.
function eased(t: number) {
  const stall = t < 0.55 ? t * 1.1 : 0.605 + (t - 0.55) * 0.35
  return t > 0.85 ? stall + (t - 0.85) * ((1 - 0.7625) / 0.15) : stall
}

function tick(time: number) {
  if (!start) start = time
  const t = Math.min(1, (time - start) / duration.value)
  progress.value = Math.min(100, eased(t) * 100)
  if (t >= 1) setTimeout(finish, 250)
  else frame = requestAnimationFrame(tick)
}

const skip = () => finish()

onMounted(() => {
  frame = requestAnimationFrame(tick)
  window.addEventListener('keydown', skip)
})
onUnmounted(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('keydown', skip)
})
</script>

<template>
  <div class="boot fixed inset-0 grid cursor-none place-items-center chrome" @pointerdown="skip">
    <div class="flex flex-col items-center gap-16">
      <BrandGlyph class="mark size-24" />
      <UiProgress class="w-40" tone="light" :value="progress" :label="label" />
    </div>
  </div>
</template>

<style scoped>
.boot {
  z-index: var(--z-boot);
  background: var(--boot-bg);
}
.mark {
  color: var(--boot-fg);
}
</style>
