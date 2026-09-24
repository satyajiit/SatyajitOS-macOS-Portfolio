<script setup lang="ts">
import { ChevronDown, ChevronUp } from '@lucide/vue'

import type { TagColor } from '@/content/files'

import { kindLabel, type Item, type SortKey } from '../fs'

import ItemIcon from './ItemIcon.vue'
import TagDots from './TagDots.vue'

/** Finder list view: sortable columns, zebra rows, accent selection when the window is key. */
defineProps<{
  items: Item[]
  selectedId: string | null
  sortKey: SortKey
  sortDir: 1 | -1
  emphasized: boolean
  tagsOf: (item: Item) => TagColor[]
}>()
const emit = defineEmits<{
  select: [id: string | null]
  open: [item: Item]
  sort: [key: SortKey]
  context: [event: MouseEvent, item: Item | null]
}>()

const columns: { key: SortKey; label: string; class: string }[] = [
  { key: 'name', label: 'Name', class: 'flex-1 min-w-0 pl-9' },
  { key: 'modified', label: 'Date Modified', class: 'w-36' },
  { key: 'size', label: 'Size', class: 'w-20 justify-end text-right' },
  { key: 'kind', label: 'Kind', class: 'w-44' },
]
</script>

<template>
  <div class="flex min-h-full flex-col" @contextmenu.self.prevent="emit('context', $event, null)">
    <div class="header chrome sticky top-0 z-[1] flex h-7 items-stretch border-b border-separator bg-window-content" role="row">
      <button
        v-for="col in columns"
        :key="col.key"
        type="button"
        role="columnheader"
        class="col focus-ring flex items-center gap-1 px-2 text-callout"
        :class="[col.class, { 'is-sorted': sortKey === col.key }]"
        :aria-sort="sortKey === col.key ? (sortDir === 1 ? 'ascending' : 'descending') : 'none'"
        @click="emit('sort', col.key)"
      >
        <span class="truncate">{{ col.label }}</span>
        <template v-if="sortKey === col.key">
          <ChevronUp v-if="sortDir === 1" class="size-3 shrink-0" aria-hidden="true" />
          <ChevronDown v-else class="size-3 shrink-0" aria-hidden="true" />
        </template>
      </button>
    </div>
    <ul role="presentation" class="flex-1 px-2 py-1" @click.self="emit('select', null)" @contextmenu.self.prevent="emit('context', $event, null)">
      <li
        v-for="(item, i) in items"
        :id="`finder-item-${item.id}`"
        :key="item.id"
        role="option"
        class="row flex h-6 items-center rounded-md text-body"
        :class="{ 'is-alt': i % 2 === 1, 'is-emphasized': emphasized }"
        :aria-selected="item.id === selectedId"
        :data-id="item.id"
        :title="item.tooltip"
        @click="emit('select', item.id)"
        @dblclick="emit('open', item)"
        @contextmenu.prevent="emit('context', $event, item)"
      >
        <span class="flex min-w-0 flex-1 items-center gap-2 px-2">
          <span class="size-4 shrink-0"><ItemIcon :item="item" /></span>
          <span class="truncate">{{ item.name }}</span>
          <TagDots :colors="tagsOf(item)" />
        </span>
        <span class="meta w-36 truncate px-2">{{ item.modified ?? '--' }}</span>
        <span class="meta tabular w-20 truncate px-2 text-right">{{ item.size ?? '--' }}</span>
        <span class="meta w-44 truncate px-2">{{ kindLabel(item) }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.col {
  color: var(--label-secondary);
  font-weight: 500;
  border-right: 0.5px solid var(--separator);
}
.col:last-child {
  border-right: none;
}
.col:hover {
  background: var(--fill-quaternary);
}
.col:active {
  background: var(--fill-tertiary);
}
.col.is-sorted {
  color: var(--label);
}
.row {
  cursor: default;
  color: var(--label);
}
.row.is-alt {
  background: var(--row-alternate);
}
.meta {
  color: var(--label-secondary);
}
.row:hover:not([aria-selected='true']) {
  background: var(--fill-quaternary);
}
.row[aria-selected='true'] {
  background: var(--selection-unemphasized);
}
.row.is-emphasized[aria-selected='true'] {
  background: var(--selection);
  color: var(--label-on-accent);
}
.row.is-emphasized[aria-selected='true'] .meta {
  color: var(--label-on-accent);
  opacity: 0.85;
}
</style>
