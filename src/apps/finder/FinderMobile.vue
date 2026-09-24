<script setup lang="ts">
import { Copy, Eye, FolderOpen, Info, Share } from '@lucide/vue'
import { AnimatePresence, motion, useDragControls } from 'motion-v'
import { computed, nextTick, ref, watch } from 'vue'

import { spring } from '@/design/motion'

import { findItem, resolveLocation, tagColorsOf, type Item, type SortKey } from './fs'
import ActionSheet, { type SheetAction } from './mobile/ActionSheet.vue'
import BrowseScreen from './mobile/BrowseScreen.vue'
import FolderScreen from './mobile/FolderScreen.vue'
import InfoSheet from './mobile/InfoSheet.vue'
import PreviewSheet from './mobile/PreviewSheet.vue'
import { useFinderStore } from './store'
import { useFinderActions } from './useFinderActions'
import { useFinderRoute } from './useFinderRoute'

/**
 * Files for the phone shell: a push/pop navigation stack (Browse → folders)
 * with the iOS edge-swipe back gesture, a full-screen preview, a Get Info
 * page sheet and long-press action sheets.
 */
const finder = useFinderStore()
const actions = useFinderActions()

const ROOT = 'browse'
const stack = ref<string[]>([ROOT])
const direction = ref<1 | -1>(1)
const view = ref<'icons' | 'list'>('icons')
const sortKey = ref<SortKey>('name')
const loading = ref(false)
const previewItem = ref<Item | null>(null)
const infoItem = ref<Item | null>(null)
const actionItem = ref<Item | null>(null)
const menuOpen = ref(false)

const top = computed(() => stack.value[stack.value.length - 1] ?? ROOT)
const location = computed(() => (top.value === ROOT ? null : resolveLocation(top.value)))
const titleOf = (id: string) => (id === ROOT ? 'Browse' : (resolveLocation(id)?.name ?? ''))
const backLabel = computed(() => titleOf(stack.value[stack.value.length - 2] ?? ROOT))
const tagsFor = (item: Item) => tagColorsOf(item, finder.addedTags[item.id])

// ── Navigation stack ───────────────────────────────────────────────────────

// Set the direction first and let the outgoing screen re-render with the
// matching exit, then swap screens: push slides in from the right, pop back.
async function push(id: string) {
  if (!resolveLocation(id)) return
  direction.value = 1
  await nextTick()
  stack.value = [...stack.value, id]
  actions.folderOpened(id)
}

async function pop() {
  if (stack.value.length <= 1) return
  direction.value = -1
  await nextTick()
  stack.value = stack.value.slice(0, -1)
}

async function popToRoot() {
  if (stack.value.length <= 1) return
  direction.value = -1
  await nextTick()
  stack.value = [ROOT]
}

function openItem(item: Item) {
  if (item.kind === 'folder') void push(item.id)
  else previewItem.value = item
}

function refresh() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    actions.refreshed()
  }, 900)
}

// Edge swipe: the leftmost strip hands the drag to the current screen,
// which follows the finger 1:1 and pops if released far or fast enough.
const edgeDrag = useDragControls()
function onScreenDragEnd(_: PointerEvent, info: { offset: { x: number }; velocity: { x: number } }) {
  if (info.offset.x > 120 || info.velocity.x > 500) void pop()
}

// ── Routing ────────────────────────────────────────────────────────────────

const route = useFinderRoute((folderId, itemId) => {
  if (!resolveLocation(folderId)) return
  stack.value = [ROOT, folderId]
  const item = itemId ? findItem(itemId) : undefined
  if (item && item.kind !== 'folder') previewItem.value = item
})

watch([top, previewItem], ([id, item]) => {
  if (id !== ROOT) route.sync(id, item?.id)
})

// ── Sheets ─────────────────────────────────────────────────────────────────

const itemActions = computed<SheetAction[]>(() => {
  const item = actionItem.value
  if (!item) return []
  return [
    item.kind === 'folder'
      ? { id: 'open', label: 'Open', icon: FolderOpen }
      : { id: 'quicklook', label: 'Quick Look', icon: Eye },
    { id: 'info', label: 'Get Info', icon: Info },
    { id: 'share', label: 'Share', icon: Share },
    { id: 'copy', label: 'Copy', icon: Copy },
  ]
})

function onItemAction(id: string) {
  const item = actionItem.value
  actionItem.value = null
  if (!item) return
  if (id === 'open' || id === 'quicklook') openItem(item)
  else if (id === 'info') infoItem.value = item
  else if (id === 'share') void actions.share(item)
  else if (id === 'copy') void actions.copyName(item)
}

const menuActions = computed<SheetAction[]>(() => [
  { id: 'icons', label: 'Icons', checked: view.value === 'icons' },
  { id: 'list', label: 'List', checked: view.value === 'list' },
  { id: 'sort-name', label: 'Sort by Name', checked: sortKey.value === 'name' },
  { id: 'sort-modified', label: 'Sort by Date', checked: sortKey.value === 'modified' },
  { id: 'sort-size', label: 'Sort by Size', checked: sortKey.value === 'size' },
  { id: 'sort-kind', label: 'Sort by Kind', checked: sortKey.value === 'kind' },
  { id: 'refresh', label: 'Refresh' },
  { id: 'new-folder', label: 'New Folder' },
])

function onMenuAction(id: string) {
  menuOpen.value = false
  if (id === 'icons' || id === 'list') view.value = id
  else if (id.startsWith('sort-')) sortKey.value = id.slice(5) as SortKey
  else if (id === 'refresh') refresh()
  else if (id === 'new-folder') actions.newFolder()
}

function showInfoFromPreview(item: Item) {
  previewItem.value = null
  infoItem.value = item
}
</script>

<template>
  <div class="files relative h-full overflow-clip bg-ios-bg">
    <AnimatePresence :initial="false">
      <motion.div
        :key="`${stack.length}:${top}`"
        class="screen absolute inset-0"
        drag="x"
        :drag-listener="false"
        :drag-controls="edgeDrag"
        :drag-constraints="{ left: 0, right: 0 }"
        :drag-elastic="{ left: 0, right: 1 }"
        :drag-momentum="false"
        :initial="{ x: direction === 1 ? '100%' : '-30%' }"
        :animate="{ x: 0 }"
        :exit="{ x: direction === 1 ? '-30%' : '100%' }"
        :transition="spring.default"
        @drag-end="onScreenDragEnd"
      >
        <BrowseScreen v-if="top === 'browse'" @push="push" @item="openItem" />
        <FolderScreen
          v-else-if="location"
          :location="location"
          :back="backLabel"
          :view="view"
          :sort-key="sortKey"
          :loading="loading"
          :added-tags="finder.addedTags"
          @back="pop"
          @open="openItem"
          @actions="(item) => (actionItem = item)"
          @info="(item) => (infoItem = item)"
          @menu="menuOpen = true"
          @retry="refresh"
          @home="popToRoot"
          @blame="actions.blameSomeone()"
        />
        <div
          v-if="stack.length > 1"
          class="edge absolute inset-y-0 left-0 z-20 w-5 touch-none"
          aria-hidden="true"
          @pointerdown="edgeDrag.start($event)"
        />
      </motion.div>
    </AnimatePresence>

    <PreviewSheet
      :item="previewItem"
      @close="previewItem = null"
      @info="showInfoFromPreview"
      @share="actions.share"
      @home="((previewItem = null), popToRoot())"
      @blame="actions.blameSomeone()"
    />
    <InfoSheet
      :item="infoItem"
      :tag-colors="infoItem ? tagsFor(infoItem) : []"
      @close="infoItem = null"
      @open="(item) => ((infoItem = null), openItem(item))"
      @share="actions.share"
    />
    <ActionSheet
      :open="!!actionItem"
      :title="actionItem?.name"
      :message="actionItem?.tooltip"
      :actions="itemActions"
      :tag-colors="actionItem ? tagsFor(actionItem) : undefined"
      @select="onItemAction"
      @tag="(color) => actionItem && finder.toggleTag(actionItem.id, color)"
      @cancel="actionItem = null"
    />
    <ActionSheet :open="menuOpen" :title="location?.name" :actions="menuActions" @select="onMenuAction" @cancel="menuOpen = false" />
  </div>
</template>

<style scoped>
.screen {
  box-shadow: -8px 0 24px var(--tint-scrim);
}
</style>
