<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { computed, ref } from 'vue'

import type { TagColor } from '@/content/files'

import type { Item } from '../fs'

import ItemIcon from './ItemIcon.vue'
import TagDots from './TagDots.vue'

/** Finder icon view: icons with two-line labels, a grey plate and accent pill on selection. */
const props = defineProps<{
  items: Item[]
  selectedId: string | null
  iconSize: number
  emphasized: boolean
  tagsOf: (item: Item) => TagColor[]
}>()
const emit = defineEmits<{
  select: [id: string | null]
  open: [item: Item]
  context: [event: MouseEvent, item: Item | null]
}>()

const grid = ref<HTMLElement | null>(null)
const { width } = useElementSize(grid)
const cellWidth = computed(() => Math.max(96, props.iconSize + 44))
/** Arrow-up/down need to know how many icons fit on a row. */
const columns = computed(() => Math.max(1, Math.floor((width.value + 8) / (cellWidth.value + 8))))
defineExpose({ columns })
</script>

<template>
  <ul
    ref="grid"
    role="presentation"
    class="grid content-start gap-x-2 gap-y-3 p-4"
    :style="{ gridTemplateColumns: `repeat(auto-fill, minmax(${cellWidth}px, 1fr))` }"
    @click.self="emit('select', null)"
    @contextmenu.self.prevent="emit('context', $event, null)"
  >
    <li
      v-for="item in items"
      :id="`finder-item-${item.id}`"
      :key="item.id"
      role="option"
      class="cell flex flex-col items-center gap-1"
      :aria-selected="item.id === selectedId"
      :data-id="item.id"
      :title="item.tooltip"
      @click="emit('select', item.id)"
      @dblclick="emit('open', item)"
      @contextmenu.prevent="emit('context', $event, item)"
    >
      <div class="plate grid place-items-center" :style="{ width: `${iconSize + 12}px`, height: `${iconSize + 12}px` }">
        <div :style="{ width: `${iconSize}px`, height: `${iconSize}px` }"><ItemIcon :item="item" /></div>
      </div>
      <div class="flex max-w-full items-start gap-1">
        <span class="label" :class="{ 'is-emphasized': emphasized }">{{ item.name }}</span>
        <TagDots class="mt-1" :colors="tagsOf(item)" />
      </div>
    </li>
  </ul>
</template>

<style scoped>
.cell {
  cursor: default;
  padding-bottom: 2px;
}
.plate {
  border-radius: var(--radius-lg);
}
.label {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: var(--text-callout);
  line-height: 15px;
  text-align: center;
  color: var(--label);
}
.cell:hover .plate {
  background: var(--fill-quaternary);
}
.cell[aria-selected='true'] .plate {
  background: var(--fill-secondary);
}
.cell[aria-selected='true'] .label {
  background: var(--selection-unemphasized);
}
.cell[aria-selected='true'] .label.is-emphasized {
  background: var(--selection);
  color: var(--label-on-accent);
}
</style>
