<script setup lang="ts">
import { AnimatePresence, motion, useDragControls } from 'motion-v'
import { computed } from 'vue'

import type { TagColor } from '@/content/files'
import { exit, spring } from '@/design/motion'
import { IconText, IosButton, UiListGroup, UiListRow } from '@/ui'

import ItemIcon from '../components/ItemIcon.vue'
import TagDots from '../components/TagDots.vue'
import { funStatsOf, insightOf, kindLabel, type Item } from '../fs'

/** Get Info as an iOS page sheet: drag the grabber down (or flick) to dismiss. */
const props = defineProps<{ item: Item | null; tagColors: TagColor[] }>()
const emit = defineEmits<{ close: []; open: [item: Item]; share: [item: Item] }>()

const drag = useDragControls()
const stats = computed(() => (props.item ? funStatsOf(props.item) : null))
const where = computed(() => props.item?.path.split('/').slice(0, -1).join('/') || '/')

function onDragEnd(_: PointerEvent, info: { offset: { y: number }; velocity: { y: number } }) {
  if (info.offset.y > 120 || info.velocity.y > 600) emit('close')
}
</script>

<template>
  <AnimatePresence>
    <motion.div
      v-if="item"
      key="scrim"
      class="absolute inset-0 z-30 bg-scrim"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0, transition: { duration: exit(0.3) } }"
      @click="emit('close')"
    />
    <motion.section
      v-if="item"
      key="sheet"
      class="sheet absolute inset-x-0 bottom-0 z-40 flex flex-col overflow-clip bg-ios-grouped"
      role="dialog"
      :aria-label="`${item.name} info`"
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
      <header class="chrome shrink-0 touch-none pb-2 pt-2" @pointerdown="drag.start($event)">
        <div class="mx-auto h-[5px] w-9 rounded-full bg-ios-fill" aria-hidden="true" />
        <div class="relative mt-2 flex h-8 items-center justify-center px-4">
          <p class="text-ios-headline text-ios-label">Info</p>
          <button
            type="button"
            class="focus-ring absolute right-4 text-ios-body font-semibold text-accent active:opacity-50"
            @click="emit('close')"
          >
            Done
          </button>
        </div>
      </header>

      <div class="min-h-0 flex-1 overflow-y-auto pb-8">
        <div class="flex flex-col items-center gap-1 px-6 pb-6 pt-2 text-center">
          <div class="mb-2 size-24"><ItemIcon :item="item" /></div>
          <p class="break-words text-ios-headline text-ios-label">{{ item.name }}</p>
          <p class="text-ios-footnote text-ios-label-secondary">{{ kindLabel(item) }} · {{ item.size ?? '--' }}</p>
        </div>

        <UiListGroup header="Information">
          <UiListRow title="Kind" :detail="kindLabel(item)" />
          <UiListRow title="Size" :detail="item.size ?? '--'" />
          <UiListRow title="Where" :detail="where" />
          <UiListRow title="Modified" :detail="item.modified ?? '--'" />
        </UiListGroup>

        <UiListGroup v-if="item.tags?.length || tagColors.length" header="Tags">
          <li class="flex flex-wrap items-center gap-2 px-4 py-3">
            <TagDots :colors="tagColors" />
            <span
              v-for="tag in item.tags"
              :key="tag"
              class="rounded-full bg-ios-fill-tertiary px-2.5 py-0.5 text-ios-footnote text-ios-label"
            >
              {{ tag }}
            </span>
          </li>
        </UiListGroup>

        <UiListGroup header="Insider Info" :footer="item.tooltip ? `Pro tip: ${item.tooltip}` : undefined">
          <li class="px-4 py-3 text-ios-body text-ios-label"><IconText :text="insightOf(item)" /></li>
        </UiListGroup>

        <UiListGroup v-if="stats" header="Fun Stats">
          <UiListRow title="Times opened" :detail="String(stats.timesOpened)" />
          <UiListRow title="Procrastination level" :detail="`${stats.procrastination}/10`" />
          <UiListRow title="Importance" :detail="stats.importance" />
          <UiListRow title="Coffee while creating" :detail="`${stats.coffee} cups`" />
        </UiListGroup>

        <div class="flex flex-col gap-3 px-4">
          <IosButton @click="emit('open', item)">{{ item.kind === 'folder' ? 'Open Folder' : 'Open File' }}</IosButton>
          <button
            type="button"
            class="focus-ring h-11 text-ios-body text-accent active:opacity-50"
            @click="emit('share', item)"
          >
            Share Story
          </button>
        </div>
      </div>
    </motion.section>
  </AnimatePresence>
</template>

<style scoped>
.sheet {
  top: calc(var(--ios-status-height, 0px) + 10px);
  border-radius: 12px 12px 0 0;
}
</style>
