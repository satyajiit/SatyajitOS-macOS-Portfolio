<script setup lang="ts">
import { Pause, Play, SkipForward } from '@lucide/vue'
import { usePreferredReducedMotion } from '@vueuse/core'
import { AnimatePresence, motion } from 'motion-v'
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { quotes } from '@/content/quotes'
import { duration, ease } from '@/design/motion'
import UiIconButton from '@/ui/UiIconButton.vue'

/**
 * A medium desktop widget: one quote at a time, crossfading every few
 * seconds. Hover (or focus) pauses the timer and shows the controls.
 */
const INTERVAL = 8000
const index = ref(Math.floor(Math.random() * quotes.length))
const playing = ref(true)
const hovering = ref(false)
const reduced = usePreferredReducedMotion()

const quote = computed(() => quotes[index.value]!)
let timer: ReturnType<typeof setInterval> | null = null

function next() {
  index.value = (index.value + 1) % quotes.length
}

function start() {
  stop()
  timer = setInterval(() => {
    if (playing.value && !hovering.value && document.visibilityState === 'visible') next()
  }, INTERVAL)
}
function stop() {
  if (timer) clearInterval(timer)
  timer = null
}

onMounted(start)
onUnmounted(stop)

const fade = computed(() =>
  reduced.value === 'reduce'
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 } },
)
</script>

<template>
  <section
    class="widget material-widget chrome fixed flex flex-col rounded-widget p-4"
    aria-label="Quote widget"
    aria-live="polite"
    @pointerenter="hovering = true"
    @pointerleave="hovering = false"
    @focusin="hovering = true"
    @focusout="hovering = false"
  >
    <p class="text-subheadline font-semibold text-accent">{{ quote.category }}</p>
    <div class="relative mt-1 min-h-0 flex-1">
      <AnimatePresence mode="wait">
        <motion.figure
          :key="index"
          class="absolute inset-0 flex flex-col justify-between"
          :initial="fade.initial"
          :animate="fade.animate"
          :exit="fade.exit"
          :transition="{ duration: duration.short, ease: ease.out }"
        >
          <blockquote class="quote text-title-3 font-semibold text-label">{{ quote.text }}</blockquote>
          <figcaption class="text-callout text-label-secondary">{{ quote.author }}</figcaption>
        </motion.figure>
      </AnimatePresence>
    </div>

    <div class="controls absolute bottom-2.5 right-2.5 flex gap-0.5" :class="{ 'is-visible': hovering }">
      <UiIconButton size="small" :label="playing ? 'Pause' : 'Play'" @click="playing = !playing">
        <Pause v-if="playing" />
        <Play v-else />
      </UiIconButton>
      <UiIconButton size="small" label="Next quote" @click="next">
        <SkipForward />
      </UiIconButton>
    </div>
  </section>
</template>

<style scoped>
.widget {
  top: calc(var(--menubar-height) + 16px);
  left: 18px;
  width: 330px;
  height: 158px;
  z-index: var(--z-widgets);
}
.quote {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-wrap: pretty;
}
.controls {
  opacity: 0;
  transition: opacity var(--dur-micro) var(--ease-out);
}
.controls.is-visible {
  opacity: 1;
}
</style>
