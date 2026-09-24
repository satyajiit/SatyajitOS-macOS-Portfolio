<script setup lang="ts">
import { Info, Share } from '@lucide/vue'
import { AnimatePresence, motion, useDragControls } from 'motion-v'

import { exit, spring } from '@/design/motion'

import PreviewBody from '../components/PreviewBody.vue'
import StateView from '../components/StateView.vue'
import type { Item } from '../fs'

/**
 * Full-screen Quick Look, iOS style: Done on the left, share on the right,
 * info/share toolbar at the bottom. Drag the bar down to dismiss.
 */
const props = defineProps<{ item: Item | null }>()
const emit = defineEmits<{ close: []; info: [item: Item]; share: [item: Item]; blame: []; home: [] }>()

const drag = useDragControls()

function onDragEnd(_: PointerEvent, info: { offset: { y: number }; velocity: { y: number } }) {
  if (info.offset.y > 140 || info.velocity.y > 700) emit('close')
}
</script>

<template>
  <AnimatePresence>
    <motion.section
      v-if="props.item"
      class="absolute inset-0 z-40 flex flex-col bg-ios-bg"
      role="dialog"
      :aria-label="props.item.name"
      drag="y"
      :drag-listener="false"
      :drag-controls="drag"
      :drag-constraints="{ top: 0, bottom: 0 }"
      :drag-elastic="{ top: 0.05, bottom: 1 }"
      :initial="{ y: '100%' }"
      :animate="{ y: 0 }"
      :exit="{ y: '100%', transition: { duration: exit(0.35) } }"
      :transition="spring.default"
      @drag-end="onDragEnd"
    >
      <header
        class="chrome material-ios-bar grid h-11 shrink-0 touch-none grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-ios-separator px-4 pt-(--ios-status-height,0px)"
        style="box-sizing: content-box"
        @pointerdown="drag.start($event)"
      >
        <button type="button" class="focus-ring text-ios-body font-semibold text-accent active:opacity-50" @click="emit('close')">
          Done
        </button>
        <p class="truncate text-center text-ios-headline text-ios-label">{{ props.item.name }}</p>
        <button
          type="button"
          class="focus-ring grid size-8 place-items-center text-accent active:opacity-50"
          aria-label="Share"
          @click="emit('share', props.item)"
        >
          <Share class="size-5" aria-hidden="true" />
        </button>
      </header>

      <div class="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <StateView
          v-if="props.item.opensWith"
          state="error"
          platform="ios"
          :error-type="props.item.opensWith"
          @retry="() => {}"
          @home="emit('home')"
          @blame="emit('blame')"
        />
        <PreviewBody :item="props.item" platform="ios" />
      </div>

      <footer class="toolbar chrome material-ios-bar flex h-12 shrink-0 items-center justify-around border-t border-ios-separator">
        <button
          type="button"
          class="focus-ring grid size-11 place-items-center text-accent active:opacity-50"
          aria-label="Get Info"
          @click="emit('info', props.item)"
        >
          <Info class="size-6" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="focus-ring grid size-11 place-items-center text-accent active:opacity-50"
          aria-label="Share"
          @click="emit('share', props.item)"
        >
          <Share class="size-6" aria-hidden="true" />
        </button>
      </footer>
    </motion.section>
  </AnimatePresence>
</template>

<style scoped>
.toolbar {
  box-sizing: content-box;
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
