<script setup lang="ts">
import { Quote as QuoteGlyph } from '@lucide/vue'
import { useIntervalFn } from '@vueuse/core'
import { computed, ref } from 'vue'

import { quotes } from '@/content/quotes'
import { useAppearanceStore } from '@/stores/appearance'

/**
 * Medium home-screen widget cycling through the quotes. Tap for the next one;
 * it also advances on its own every 12 seconds.
 */
const appearance = useAppearanceStore()
const index = ref(Math.floor(Math.random() * quotes.length))
const quote = computed(() => quotes[index.value]!)
const next = () => (index.value = (index.value + 1) % quotes.length)
const { pause, resume } = useIntervalFn(next, 12000)

function tap() {
  next()
  pause()
  resume()
}
</script>

<template>
  <figure class="flex flex-col items-center gap-1.5">
    <button
      type="button"
      class="widget material-ios-platter rounded-ios-card focus-ring"
      aria-label="Next quote"
      @click="tap"
    >
      <Transition name="quote" mode="out-in">
        <span :key="index" class="flex h-full flex-col">
          <span class="flex items-center justify-between">
            <QuoteGlyph class="size-5 text-brand" style="stroke-width: 2.2" aria-hidden="true" />
            <span
              class="rounded-full bg-ios-fill-tertiary px-2 py-0.5 text-ios-caption-2 font-semibold text-ios-label-secondary"
            >
              {{ quote.category }}
            </span>
          </span>
          <blockquote
            class="mt-2 line-clamp-3 min-h-0 text-left text-ios-subheadline font-semibold text-ios-label min-[380px]:text-ios-headline"
          >
            “{{ quote.text }}”
          </blockquote>
          <span class="mt-auto shrink-0 truncate pt-1 text-left text-ios-footnote text-ios-label-secondary">
            — {{ quote.author }}
          </span>
        </span>
      </Transition>
    </button>
    <figcaption
      class="text-ios-caption-2 font-medium"
      :class="appearance.isDark ? 'text-white text-shadow-desktop' : 'text-ios-label'"
    >
      Quotes
    </figcaption>
  </figure>
</template>

<style scoped>
.widget {
  width: 100%;
  /* Medium widget proportions (338×158 on a 390pt phone). */
  aspect-ratio: 338 / 158;
  min-height: 142px;
  max-height: 180px;
  overflow: clip;
  padding: 16px;
  transition: transform var(--dur-micro) var(--ease-out);
}

.widget:active {
  transform: scale(0.97);
}

.quote-enter-active,
.quote-leave-active {
  transition: opacity var(--dur-short) var(--ease-out);
}
.quote-leave-active {
  transition-duration: calc(var(--dur-short) * 0.75);
}
.quote-enter-from,
.quote-leave-to {
  opacity: 0;
}
</style>
