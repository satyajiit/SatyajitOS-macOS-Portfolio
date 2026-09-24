<script setup lang="ts">
import { computed, nextTick, onMounted, watch } from 'vue'

import { UiButton } from '@/ui'

import { kindLabel, type Item } from '../fs'

import ItemIcon from './ItemIcon.vue'
import PreviewBody from './PreviewBody.vue'

/** Gallery view: a large preview of the selection over a strip of thumbnails. */
const props = defineProps<{ items: Item[]; selectedId: string | null }>()
const emit = defineEmits<{
  select: [id: string | null]
  open: [item: Item]
  quicklook: [item: Item]
  context: [event: MouseEvent, item: Item | null]
}>()

const current = computed(() => props.items.find((i) => i.id === props.selectedId) ?? props.items[0] ?? null)

onMounted(() => {
  if (!props.selectedId && props.items[0]) emit('select', props.items[0].id)
})

watch(
  () => props.selectedId,
  async (id) => {
    await nextTick()
    document.getElementById(`finder-strip-${id}`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  },
)
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <div class="flex min-h-0 flex-1">
      <div class="min-w-0 flex-1 overflow-y-auto p-6">
        <PreviewBody v-if="current" :item="current" class="mx-auto max-w-xl" />
      </div>
      <aside v-if="current" class="flex w-56 shrink-0 flex-col gap-3 overflow-y-auto border-l border-separator p-4">
        <div class="mx-auto size-16"><ItemIcon :item="current" /></div>
        <div class="text-center">
          <h2 class="text-headline break-words text-label">{{ current.name }}</h2>
          <p class="text-callout text-label-secondary">{{ kindLabel(current) }} · {{ current.size ?? '--' }}</p>
        </div>
        <dl class="flex flex-col gap-1 text-callout">
          <div class="flex justify-between gap-2">
            <dt class="text-label-secondary">Modified</dt>
            <dd class="text-right text-label">{{ current.modified ?? '--' }}</dd>
          </div>
          <div v-if="current.tags?.length" class="flex justify-between gap-2">
            <dt class="text-label-secondary">Tags</dt>
            <dd class="text-right text-label">{{ current.tags.join(', ') }}</dd>
          </div>
        </dl>
        <p v-if="current.description" class="text-callout text-label-secondary">{{ current.description }}</p>
        <div class="mt-auto flex flex-col gap-2">
          <UiButton size="small" @click="emit('quicklook', current)">Quick Look</UiButton>
          <UiButton size="small" @click="emit('open', current)">Open</UiButton>
        </div>
      </aside>
    </div>
    <ul class="strip flex shrink-0 gap-2 overflow-x-auto border-t border-separator px-4 py-2.5" role="presentation">
      <li
        v-for="item in items"
        :id="`finder-strip-${item.id}`"
        :key="item.id"
        role="option"
        class="thumb grid size-14 shrink-0 place-items-center rounded-lg p-1"
        :aria-selected="item.id === current?.id"
        :data-id="item.id"
        :title="item.name"
        @click="emit('select', item.id)"
        @dblclick="emit('open', item)"
        @contextmenu.prevent="emit('context', $event, item)"
      >
        <ItemIcon :item="item" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.thumb {
  cursor: default;
}
.thumb:hover {
  background: var(--fill-quaternary);
}
.thumb[aria-selected='true'] {
  background: var(--fill-secondary);
  box-shadow: inset 0 0 0 2px var(--accent);
}
</style>
