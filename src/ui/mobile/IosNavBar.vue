<script setup lang="ts">
import { ChevronLeft } from '@lucide/vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * UINavigationBar. Only the 44pt bar is sticky; with `large`, the big title
 * sits in the scroll flow under it and scrolls away, and the inline title
 * fades in once it has gone (like UIKit). Scroll state is detected
 * automatically; pass `scrolled` only to override it.
 */
const props = withDefaults(
  defineProps<{ title: string; large?: boolean; back?: string; scrolled?: boolean }>(),
  { large: false, back: undefined, scrolled: undefined },
)
defineEmits<{ back: [] }>()

const largeTitle = ref<HTMLElement | null>(null)
const titleHidden = ref(false)
const collapsed = computed(() => props.scrolled ?? titleHidden.value)
let observer: IntersectionObserver | null = null

function scrollParent(el: HTMLElement): HTMLElement | null {
  for (let node = el.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node)
    if (overflowY === 'auto' || overflowY === 'scroll') return node
  }
  return null
}

onMounted(() => {
  const el = largeTitle.value
  if (!props.large || !el || typeof IntersectionObserver === 'undefined') return
  const root = scrollParent(el)
  const barBottom = el.previousElementSibling?.getBoundingClientRect().height ?? 44
  observer = new IntersectionObserver(
    ([entry]) => (titleHidden.value = !!entry && !entry.isIntersecting),
    { root, rootMargin: `-${Math.round(barBottom)}px 0px 0px 0px`, threshold: 0 },
  )
  observer.observe(el)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div class="contents">
    <header
      class="bar chrome sticky top-0 z-10 grid h-11 grid-cols-[1fr_auto_1fr] items-center px-2 pt-(--ios-status-height,0px) transition-colors duration-150"
      :class="collapsed || !large ? 'material-ios-bar border-b border-ios-separator' : 'border-b border-transparent'"
      :style="{ boxSizing: 'content-box' }"
    >
      <div class="flex min-w-0 items-center">
        <button
          v-if="back"
          type="button"
          class="focus-ring flex h-11 min-w-0 items-center text-ios-body text-accent active:opacity-50"
          @click="$emit('back')"
        >
          <ChevronLeft class="-ml-1 size-7 shrink-0" style="stroke-width: 2.4" aria-hidden="true" />
          <span class="truncate">{{ back }}</span>
        </button>
        <slot name="leading" />
      </div>
      <p
        class="max-w-[60vw] truncate text-ios-headline text-ios-label transition-opacity duration-150"
        :class="large && !collapsed ? 'opacity-0' : 'opacity-100'"
        :aria-hidden="large || undefined"
      >
        {{ title }}
      </p>
      <div class="flex items-center justify-end gap-3 pr-2 text-accent">
        <slot name="trailing" />
      </div>
    </header>
    <h1
      v-if="large"
      ref="largeTitle"
      class="px-4 pb-2 pt-1 text-ios-large-title text-ios-label"
    >
      {{ title }}
    </h1>
    <h1 v-else-if="title" class="sr-only">{{ title }}</h1>
  </div>
</template>
