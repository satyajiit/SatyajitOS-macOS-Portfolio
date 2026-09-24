<script setup lang="ts">
import { ChevronRight, Ellipsis, Info } from '@lucide/vue'
import { computed, ref } from 'vue'

import { IosNavBar, UiSearchField } from '@/ui'

import ItemIcon from '../components/ItemIcon.vue'
import StateView from '../components/StateView.vue'
import TagDots from '../components/TagDots.vue'
import { searchItems, sortItems, tagColorsOf, type Item, type Location, type SortKey } from '../fs'

/**
 * A folder in Files: large title, search, then a 3-column icon grid or a
 * list. Tap opens, long-press (or right-click) brings up the action sheet.
 */
const props = defineProps<{
  location: Location
  back: string
  view: 'icons' | 'list'
  sortKey: SortKey
  loading: boolean
  addedTags: Record<string, string[]>
}>()
const emit = defineEmits<{
  back: []
  open: [item: Item]
  actions: [item: Item]
  info: [item: Item]
  menu: []
  retry: []
  home: []
  blame: []
}>()

const query = ref('')
const items = computed(() =>
  sortItems(searchItems(query.value, props.location.items), props.sortKey, 1),
)
const state = computed(() => {
  if (props.loading) return 'loading'
  if (props.location.error) return 'error'
  if (!items.value.length) return query.value.trim() ? 'noResults' : 'empty'
  return null
})
const count = computed(() => `${items.value.length} ${items.value.length === 1 ? 'item' : 'items'}`)

// Long-press to show actions; cancelled by movement or an early release.
let pressTimer: ReturnType<typeof setTimeout> | undefined
let pressed = false
function pressStart(item: Item) {
  pressed = false
  pressTimer = setTimeout(() => {
    pressed = true
    navigator.vibrate?.([30])
    emit('actions', item)
  }, 500)
}
function pressEnd() {
  clearTimeout(pressTimer)
}
function tap(item: Item) {
  if (pressed) return
  navigator.vibrate?.(10)
  emit('open', item)
}
</script>

<template>
  <div class="h-full overflow-y-auto bg-ios-bg">
    <IosNavBar :title="location.name" large :back="back" @back="emit('back')">
      <template #trailing>
        <button type="button" class="focus-ring grid size-8 place-items-center active:opacity-50" aria-label="More" @click="emit('menu')">
          <Ellipsis class="size-6" aria-hidden="true" />
        </button>
      </template>
    </IosNavBar>

    <div class="px-4 pb-2">
      <UiSearchField v-model="query" platform="ios" :placeholder="`Search in ${location.name}`" />
    </div>
    <p v-if="!state" class="px-4 pb-2 text-ios-footnote text-ios-label-secondary">
      {{ count }}<template v-if="location.description"> · {{ location.description }}</template>
    </p>

    <StateView
      v-if="state"
      :state="state"
      platform="ios"
      :error-type="location.error ?? 'generic'"
      :query="query"
      @clear="query = ''"
      @retry="emit('retry')"
      @home="emit('home')"
      @blame="emit('blame')"
    />

    <ul v-else-if="view === 'icons'" class="grid grid-cols-3 gap-x-2 gap-y-5 px-3 pb-10 pt-2" role="list">
      <li v-for="item in items" :key="item.id">
        <button
          type="button"
          class="cell focus-ring flex w-full flex-col items-center gap-1 rounded-xl p-1"
          @click="tap(item)"
          @pointerdown="pressStart(item)"
          @pointerup="pressEnd"
          @pointerleave="pressEnd"
          @pointercancel="pressEnd"
          @contextmenu.prevent="emit('actions', item)"
        >
          <span class="block size-[76px]"><ItemIcon :item="item" /></span>
          <span class="name line-clamp-2 break-all text-center text-ios-caption-1 text-ios-label">{{ item.name }}</span>
          <span class="flex items-center gap-1 text-ios-caption-2 text-ios-label-secondary">
            <TagDots :colors="tagColorsOf(item, addedTags[item.id])" />
            {{ item.kind === 'folder' ? 'Folder' : item.modified }}
          </span>
          <span v-if="item.size" class="text-ios-caption-2 text-ios-label-secondary">{{ item.size }}</span>
        </button>
      </li>
    </ul>

    <ul v-else class="pb-10" role="list">
      <li v-for="item in items" :key="item.id" class="list-row">
        <div class="flex items-center">
          <button
            type="button"
            class="cell focus-ring flex min-w-0 flex-1 items-center gap-3 py-2 pl-4 text-left"
            @click="tap(item)"
            @pointerdown="pressStart(item)"
            @pointerup="pressEnd"
            @pointerleave="pressEnd"
            @pointercancel="pressEnd"
            @contextmenu.prevent="emit('actions', item)"
          >
            <span class="block size-11 shrink-0"><ItemIcon :item="item" /></span>
            <span class="body flex min-w-0 flex-1 flex-col py-1.5">
              <span class="flex items-center gap-1.5">
                <span class="truncate text-ios-body text-ios-label">{{ item.name }}</span>
                <TagDots :colors="tagColorsOf(item, addedTags[item.id])" />
              </span>
              <span class="truncate text-ios-footnote text-ios-label-secondary">
                {{ [item.modified, item.size].filter(Boolean).join(' – ') || item.description || 'Folder' }}
              </span>
            </span>
          </button>
          <button
            v-if="item.kind !== 'folder'"
            type="button"
            class="focus-ring grid size-11 shrink-0 place-items-center text-accent active:opacity-50"
            :aria-label="`Info for ${item.name}`"
            @click="emit('info', item)"
          >
            <Info class="size-[22px]" aria-hidden="true" />
          </button>
          <ChevronRight v-else class="mr-4 size-4 shrink-0 text-ios-label-tertiary" style="stroke-width: 2.5" aria-hidden="true" />
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.cell {
  -webkit-touch-callout: none;
  user-select: none;
}
.cell:active {
  background: var(--ios-fill-quaternary);
}
.list-row .body {
  border-bottom: 0.5px solid var(--ios-separator);
}
.list-row:last-child .body {
  border-bottom: none;
}
</style>
