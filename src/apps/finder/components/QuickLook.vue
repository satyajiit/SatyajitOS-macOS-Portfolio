<script setup lang="ts">
import { ChevronLeft, ChevronRight, Share, X } from '@lucide/vue'
import { AnimatePresence, motion } from 'motion-v'
import { computed, nextTick, ref, watch } from 'vue'

import { exit, spring } from '@/design/motion'
import { IconText, UiButton, UiIconButton } from '@/ui'

import { funStatsOf, kindLabel, kindQuipOf, openWithApp, quipOf, type Item } from '../fs'

import PreviewBody from './PreviewBody.vue'

/**
 * Quick Look: a floating preview of the selected item. Space or Esc closes it,
 * arrows step through the folder, Return opens the file.
 */
const props = defineProps<{ item: Item | null; canNavigate: boolean }>()
const emit = defineEmits<{ close: []; open: [item: Item]; navigate: [delta: number]; share: [item: Item] }>()

const layer = ref<HTMLElement | null>(null)
const stats = computed(() => (props.item ? funStatsOf(props.item) : null))

watch(
  () => !!props.item,
  async (open) => {
    if (!open) return
    await nextTick()
    layer.value?.querySelector<HTMLElement>('[role="dialog"]')?.focus()
  },
)

function onKey(event: KeyboardEvent) {
  if (!props.item) return
  if (event.key === 'Escape' || event.key === ' ') emit('close')
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') emit('navigate', -1)
  else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') emit('navigate', 1)
  else if (event.key === 'Enter') emit('open', props.item)
  else return
  event.preventDefault()
  event.stopPropagation()
}
</script>

<template>
  <Teleport to="body">
    <AnimatePresence>
      <div v-if="item" ref="layer" class="quicklook-layer pointer-events-none fixed inset-x-0 flex justify-center">
        <motion.section
          class="panel pointer-events-auto flex flex-col overflow-clip rounded-window bg-window-content shadow-window outline-none"
          role="dialog"
          :aria-label="`Quick Look: ${item.name}`"
          tabindex="-1"
          :initial="{ opacity: 0, scale: 0.96 }"
          :animate="{ opacity: 1, scale: 1 }"
          :exit="{ opacity: 0, scale: 0.96, transition: { duration: exit(0.2) } }"
          :transition="spring.default"
          @keydown="onKey"
        >
          <header class="chrome material-titlebar flex h-11 shrink-0 items-center gap-1 border-b border-separator px-2">
            <UiIconButton label="Close Quick Look" size="small" @click="emit('close')">
              <X aria-hidden="true" />
            </UiIconButton>
            <template v-if="canNavigate">
              <UiIconButton label="Previous item" size="small" @click="emit('navigate', -1)">
                <ChevronLeft aria-hidden="true" />
              </UiIconButton>
              <UiIconButton label="Next item" size="small" @click="emit('navigate', 1)">
                <ChevronRight aria-hidden="true" />
              </UiIconButton>
            </template>
            <h2 class="min-w-0 flex-1 truncate px-2 text-center text-headline text-label">{{ item.name }}</h2>
            <UiButton size="small" @click="emit('open', item)">Open with {{ openWithApp(item) }}</UiButton>
            <UiIconButton label="Share" size="small" @click="emit('share', item)">
              <Share aria-hidden="true" />
            </UiIconButton>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto px-8 py-6">
            <PreviewBody :item="item" />
          </div>

          <footer class="flex shrink-0 flex-col gap-2 border-t border-separator bg-window px-5 py-3 text-callout">
            <p class="text-label-secondary">
              <span class="text-label">{{ kindLabel(item) }}</span>
              <template v-if="item.size"> · {{ item.size }}</template>
              <template v-if="item.modified"> · Modified {{ item.modified }}</template>
              <template v-if="item.tags?.length"> · {{ item.tags.join(', ') }}</template>
            </p>
            <p v-if="item.description || item.tooltip" class="text-label"><IconText :text="item.description || item.tooltip" /></p>
            <p v-if="item.kind !== 'folder'" class="text-label-secondary">
              <IconText :text="kindQuipOf(item)" /> — <IconText :text="quipOf(item)" />
            </p>
            <p v-if="stats" class="tabular text-label-secondary">
              Satyajit's metadata: importance {{ stats.importance }} · {{ stats.coffee }} cups of coffee ·
              procrastination {{ stats.procrastination }}/10
            </p>
            <p class="text-subheadline text-label-tertiary">
              <kbd>Space</kbd> to close · <kbd>←</kbd> <kbd>→</kbd> to browse · <kbd>Return</kbd> to open
            </p>
          </footer>
        </motion.section>
      </div>
    </AnimatePresence>
  </Teleport>
</template>

<style scoped>
.quicklook-layer {
  top: calc(var(--menubar-height) + 20px);
  z-index: calc(var(--z-dock) - 1);
}
.panel {
  width: min(760px, calc(100vw - 48px));
  height: min(640px, calc(100dvh - var(--menubar-height) - 130px));
}
kbd {
  font-family: var(--font-sans);
  padding: 0 4px;
  border-radius: 4px;
  background: var(--fill-tertiary);
  color: var(--label-secondary);
}
</style>
