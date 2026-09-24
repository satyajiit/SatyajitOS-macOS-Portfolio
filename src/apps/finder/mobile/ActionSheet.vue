<script setup lang="ts">
import { Check } from '@lucide/vue'
import { AnimatePresence, motion } from 'motion-v'
import type { Component } from 'vue'

import { tags, type TagColor } from '@/content/files'
import { exit, spring } from '@/design/motion'
import IconText from '@/ui/IconText.vue'

import { TAG_TOKENS } from '../locations'

export interface SheetAction {
  id: string
  label: string
  icon?: Component
  destructive?: boolean
  checked?: boolean
}

/**
 * UIKit action sheet: a card of actions and a separate Cancel button,
 * rising from the bottom over a dimmed scrim. Optional tag row on top.
 */
const props = defineProps<{
  open: boolean
  title?: string
  message?: string
  actions: SheetAction[]
  tagColors?: TagColor[]
}>()
const emit = defineEmits<{ select: [id: string]; tag: [color: TagColor]; cancel: [] }>()

function choose(id: string) {
  if (typeof navigator !== 'undefined') navigator.vibrate?.(10)
  emit('select', id)
}
</script>

<template>
  <AnimatePresence>
    <motion.div
      v-if="props.open"
      key="scrim"
      class="absolute inset-0 z-30 bg-scrim"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0, transition: { duration: exit(0.25) } }"
      @click="emit('cancel')"
    />
    <motion.div
      v-if="props.open"
      key="sheet"
      class="sheet absolute inset-x-2 bottom-0 z-40 flex flex-col gap-2"
      role="dialog"
      :aria-label="title ?? 'Actions'"
      :initial="{ y: '110%' }"
      :animate="{ y: 0 }"
      :exit="{ y: '110%', transition: { duration: exit(0.3) } }"
      :transition="spring.default"
    >
      <div class="card overflow-clip rounded-sheet bg-ios-bg-tertiary">
        <header v-if="title || message" class="border-b border-ios-separator px-4 py-3 text-center">
          <p v-if="title" class="truncate text-ios-footnote font-semibold text-ios-label-secondary"><IconText :text="title" /></p>
          <p v-if="message" class="text-ios-footnote text-ios-label-secondary"><IconText :text="message" /></p>
        </header>
        <div v-if="tagColors" class="flex justify-center gap-3 border-b border-ios-separator py-3" role="group" aria-label="Tags">
          <button
            v-for="tag in tags"
            :key="tag.color"
            type="button"
            class="tag focus-ring grid place-items-center"
            :aria-pressed="tagColors.includes(tag.color)"
            :aria-label="tag.name"
            :style="{ background: TAG_TOKENS[tag.color] }"
            @click="emit('tag', tag.color)"
          >
            <Check v-if="tagColors.includes(tag.color)" class="size-4 text-white" style="stroke-width: 3" aria-hidden="true" />
          </button>
        </div>
        <button
          v-for="action in actions"
          :key="action.id"
          type="button"
          class="row focus-ring flex h-[57px] w-full items-center justify-center gap-2 border-b border-ios-separator text-ios-title-3 last:border-b-0"
          :class="action.destructive ? 'text-red' : 'text-accent'"
          @click="choose(action.id)"
        >
          <Check v-if="action.checked" class="size-5" aria-hidden="true" />
          <component :is="action.icon" v-else-if="action.icon" class="size-5" aria-hidden="true" />
          <span>{{ action.label }}</span>
        </button>
      </div>
      <button
        type="button"
        class="cancel focus-ring h-[57px] rounded-sheet bg-ios-bg-tertiary text-ios-title-3 font-semibold text-accent"
        @click="emit('cancel')"
      >
        Cancel
      </button>
    </motion.div>
  </AnimatePresence>
</template>

<style scoped>
.sheet {
  padding-bottom: calc(env(safe-area-inset-bottom) + 10px);
}
.row:active,
.cancel:active {
  background: var(--ios-fill-tertiary);
}
.tag {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  box-shadow: inset 0 0 0 0.5px var(--edge-dark);
}
.tag:active {
  transform: scale(0.92);
}
</style>
