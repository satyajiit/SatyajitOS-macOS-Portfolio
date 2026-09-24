<script setup lang="ts">
import {
  ChevronLeft,
  ChevronRight,
  CircleEllipsis,
  GalleryHorizontalEnd,
  LayoutGrid,
  List,
  Share,
} from '@lucide/vue'
import { computed, nextTick, onMounted, ref, watch } from 'vue'

import { finderCopy, sidebar, tags, type TagColor } from '@/content/files'
import { IconText, UiIconButton, UiSearchField, UiSegmented, UiSidebarItem, UiSidebarSection, UiSlider } from '@/ui'
import { useWindowContext, WindowSidebar, WindowToolbar } from '@/ui/window'

import FinderContextMenu, { type ContextAction } from './components/FinderContextMenu.vue'
import GalleryView from './components/GalleryView.vue'
import IconGrid from './components/IconGrid.vue'
import InfoPanel from './components/InfoPanel.vue'
import ListTable from './components/ListTable.vue'
import QuickLook from './components/QuickLook.vue'
import StateView, { type ErrorType } from './components/StateView.vue'
import FileIcon from './icons/FileIcon.vue'
import { breadcrumbs, locationExists, resolveLocation, tagColorsOf, tagLocationId, type Item } from './fs'
import { folderEmblem, sidebarIcon, TAG_TOKENS } from './locations'
import { useFinderStore, type ViewMode } from './store'
import { useFinderActions } from './useFinderActions'
import { useFinderRoute } from './useFinderRoute'

const finder = useFinderStore()
const actions = useFinderActions()
const ctx = useWindowContext()
const emphasized = computed(() => ctx?.isKey.value ?? true)

const content = ref<HTMLElement | null>(null)
const search = ref<InstanceType<typeof UiSearchField> | null>(null)
const grid = ref<InstanceType<typeof IconGrid> | null>(null)

const loading = ref(false)
/** A file that refused to open (Work_Life_Balance.404 and friends). */
const openError = ref<ErrorType | null>(null)
const quickLookOpen = ref(false)
const infoItem = ref<Item | null>(null)
const menu = ref<{ x: number; y: number; item: Item | null } | null>(null)
const iconSize = ref(64)
const searchQuip = ref('')

const location = computed(() => finder.location)
const items = computed(() => finder.items)
const selected = computed(() => finder.selected)
const quickLookItem = computed(() => (quickLookOpen.value ? selected.value : null))

const tagsOf = (item: Item): TagColor[] => tagColorsOf(item, finder.addedTags[item.id])

const state = computed<'loading' | 'error' | 'noResults' | 'empty' | null>(() => {
  if (loading.value) return 'loading'
  if (openError.value || (location.value.error && !finder.isSearching)) return 'error'
  if (!items.value.length) return finder.isSearching ? 'noResults' : 'empty'
  return null
})
const errorType = computed<ErrorType>(() => openError.value ?? location.value.error ?? 'generic')

const title = computed(() => (finder.isSearching ? 'Searching' : location.value.name))
const scopeOptions = computed(() => [
  { value: 'all' as const, label: 'This Mac' },
  { value: 'here' as const, label: `“${location.value.name}”` },
])
const views: { mode: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { mode: 'icons', label: 'as Icons', icon: LayoutGrid },
  { mode: 'list', label: 'as List', icon: List },
  { mode: 'gallery', label: 'as Gallery', icon: GalleryHorizontalEnd },
]

const crumbs = computed(() => {
  if (finder.isSearching && selected.value) {
    const parent = resolveLocation(selected.value.parentId)
    return [...(parent ? breadcrumbs(parent) : []), { name: selected.value.name, id: undefined }]
  }
  const base = breadcrumbs(location.value)
  return selected.value ? [...base, { name: selected.value.name, id: undefined }] : base
})

const status = computed(() => {
  if (finder.isSearching) return searchQuip.value
  const count = items.value.length
  const lead = selected.value ? `1 of ${count} selected` : `${count} ${count === 1 ? 'item' : 'items'}`
  return `${lead}, ${finderCopy.available}`
})

// ── Routing ────────────────────────────────────────────────────────────────

finder.reset()

const route = useFinderRoute((folderId, itemId) => {
  if (!locationExists(folderId)) return
  finder.open(folderId)
  openError.value = null
  if (itemId && finder.items.some((i) => i.id === itemId)) {
    finder.select(itemId)
    quickLookOpen.value = true
  }
})

watch(
  () => [finder.currentId, quickLookOpen.value ? finder.selectedId : null] as const,
  ([folderId, itemId]) => route.sync(folderId, itemId ?? undefined),
)

// ── Navigation ─────────────────────────────────────────────────────────────

function go(id: string) {
  openError.value = null
  quickLookOpen.value = false
  if (finder.open(id)) actions.folderOpened(id)
  focusContent()
}

function openItem(item: Item) {
  if (item.kind === 'folder') return go(item.id)
  if (item.opensWith) {
    openError.value = item.opensWith
    quickLookOpen.value = false
    return
  }
  finder.select(item.id)
  quickLookOpen.value = true
}

function back() {
  openError.value = null
  finder.back()
}
function forward() {
  openError.value = null
  finder.forward()
}

function refresh() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    actions.refreshed()
  }, 900)
}

function retry() {
  const failing = openError.value
  openError.value = null
  refresh()
  // Some files just stay broken.
  if (failing) setTimeout(() => (openError.value = failing), 950)
}

// ── Selection & keyboard ───────────────────────────────────────────────────

function focusContent() {
  void nextTick(() => content.value?.focus({ preventScroll: true }))
}

watch(
  () => finder.selectedId,
  async (id) => {
    if (!id) {
      quickLookOpen.value = false
      return
    }
    await nextTick()
    document.getElementById(`finder-item-${id}`)?.scrollIntoView({ block: 'nearest' })
  },
)

watch(
  () => finder.query,
  (q) => {
    if (q.trim()) searchQuip.value = actions.searchQuip(q.trim())
  },
)

let typed = ''
let typedAt = 0

function stepFor(key: string): number {
  const columns = finder.viewMode === 'icons' ? (grid.value?.columns ?? 1) : 1
  if (finder.viewMode === 'list') return key === 'ArrowDown' ? 1 : key === 'ArrowUp' ? -1 : 0
  if (key === 'ArrowRight') return 1
  if (key === 'ArrowLeft') return -1
  if (finder.viewMode === 'gallery') return 0
  return key === 'ArrowDown' ? columns : key === 'ArrowUp' ? -columns : 0
}

function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  if (target.closest('input, textarea, [role="menu"]')) return
  const cmd = event.metaKey || event.ctrlKey
  const key = event.key

  if (cmd) {
    const handled = (() => {
      if (key === '[') back()
      else if (key === ']') forward()
      else if (key === 'ArrowUp') finder.openEnclosing()
      else if ((key === 'ArrowDown' || key === 'o') && selected.value) openItem(selected.value)
      else if (key === 'i' && selected.value) infoItem.value = selected.value
      else if (key === 'f') search.value?.focus()
      else if (key === '1') finder.setView('icons')
      else if (key === '2') finder.setView('list')
      else if (key === '3' || key === '4') finder.setView('gallery')
      else if (key === 'r') refresh()
      else if (key === 'c' && selected.value) void actions.copyName(selected.value)
      else if (event.shiftKey && (key === 'N' || key === 'n')) actions.newFolder()
      else if (event.shiftKey && key === '.') actions.hiddenFiles()
      else return false
      return true
    })()
    if (handled) event.preventDefault()
    return
  }

  if (key === ' ') {
    event.preventDefault()
    if (selected.value) quickLookOpen.value = !quickLookOpen.value
  } else if (key === 'Enter') {
    if (selected.value) openItem(selected.value)
  } else if (key === 'Escape') {
    if (quickLookOpen.value) quickLookOpen.value = false
    else finder.select(null)
  } else if (key.startsWith('Arrow')) {
    const step = stepFor(key)
    if (step) {
      event.preventDefault()
      finder.moveSelection(step)
    }
  } else if (key.length === 1 && !event.altKey) {
    // Type-select: quick successive letters narrow down to a name.
    const now = Date.now()
    typed = now - typedAt < 900 ? typed + key : key
    typedAt = now
    finder.selectByPrefix(typed)
  }
}

// ── Menus & panels ─────────────────────────────────────────────────────────

function openMenu(event: MouseEvent, item: Item | null) {
  if (item) finder.select(item.id)
  menu.value = { x: event.clientX, y: event.clientY, item }
}

function openActionMenu(event: MouseEvent) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  menu.value = { x: rect.left, y: rect.bottom + 4, item: selected.value }
}

function onMenuAction(action: ContextAction) {
  const item = menu.value?.item ?? null
  const run: Record<ContextAction, () => void> = {
    open: () => item && openItem(item),
    quicklook: () => item && showQuickLook(item),
    info: () => (infoItem.value = item),
    copy: () => item && void actions.copyName(item),
    newFolder: actions.newFolder,
    refresh,
    hidden: actions.hiddenFiles,
    procrastinate: actions.procrastinate,
    blameIntern: actions.blameIntern,
    coffeeBreak: actions.coffeeBreak,
    panic: actions.panic,
  }
  run[action]()
}

function showQuickLook(item: Item) {
  finder.select(item.id)
  quickLookOpen.value = true
}

function stepQuickLook(delta: number) {
  finder.moveSelection(delta)
}

function setView(mode: ViewMode) {
  finder.setView(mode)
  focusContent()
}

onMounted(() => {
  setTimeout(() => actions.welcome(), 1000)
  if (emphasized.value) focusContent()
})
</script>

<template>
  <div class="finder flex min-h-0 w-full flex-1" @keydown="onKeydown">
    <WindowSidebar :width="196" label="Finder sidebar">
      <UiSidebarSection title="Favorites">
        <UiSidebarItem
          v-for="entry in sidebar.favorites"
          :key="entry.id"
          :selected="!finder.isSearching && finder.currentId === entry.id"
          @select="go(entry.id)"
        >
          <template #icon><component :is="sidebarIcon(entry.id)" /></template>
          {{ entry.name }}
        </UiSidebarItem>
      </UiSidebarSection>
      <UiSidebarSection title="Projects">
        <UiSidebarItem
          v-for="entry in sidebar.projects"
          :key="entry.id"
          :selected="!finder.isSearching && finder.currentId === entry.id"
          @select="go(entry.id)"
        >
          <template #icon><component :is="sidebarIcon(entry.id)" /></template>
          {{ entry.name }}
        </UiSidebarItem>
      </UiSidebarSection>
      <UiSidebarSection title="Locations">
        <UiSidebarItem
          v-for="entry in sidebar.locations"
          :key="entry.id"
          :selected="!finder.isSearching && finder.currentId === entry.id"
          @select="go(entry.id)"
        >
          <template #icon><component :is="sidebarIcon(entry.id)" /></template>
          {{ entry.name }}
        </UiSidebarItem>
      </UiSidebarSection>
      <UiSidebarSection title="Tags">
        <UiSidebarItem
          v-for="tag in tags"
          :key="tag.color"
          :selected="!finder.isSearching && finder.currentId === tagLocationId(tag.color)"
          @select="go(tagLocationId(tag.color))"
        >
          <template #icon>
            <span class="tag-dot" :style="{ background: TAG_TOKENS[tag.color] }" />
          </template>
          {{ tag.name }}
        </UiSidebarItem>
      </UiSidebarSection>
    </WindowSidebar>

    <div class="flex min-w-0 flex-1 flex-col bg-window-content">
      <WindowToolbar :lights="false" :title="title">
        <template #leading>
          <UiIconButton label="Back" :disabled="!finder.canGoBack" @click="back">
            <ChevronLeft aria-hidden="true" />
          </UiIconButton>
          <UiIconButton label="Forward" :disabled="!finder.canGoForward" @click="forward">
            <ChevronRight aria-hidden="true" />
          </UiIconButton>
        </template>
        <template #trailing>
          <div class="view-group flex rounded-control" role="group" aria-label="View">
            <UiIconButton
              v-for="view in views"
              :key="view.mode"
              :label="`View ${view.label}`"
              :pressed="finder.viewMode === view.mode"
              @click="setView(view.mode)"
            >
              <component :is="view.icon" aria-hidden="true" />
            </UiIconButton>
          </div>
          <UiIconButton label="Share" :disabled="!selected" @click="selected && actions.share(selected)">
            <Share aria-hidden="true" />
          </UiIconButton>
          <UiIconButton label="Action" @click="openActionMenu">
            <CircleEllipsis aria-hidden="true" />
          </UiIconButton>
          <UiSearchField
            ref="search"
            class="w-44"
            :model-value="finder.query"
            placeholder="Search"
            @update:model-value="finder.setQuery"
          />
        </template>
      </WindowToolbar>

      <div
        v-if="finder.isSearching"
        class="chrome flex h-9 shrink-0 items-center gap-3 border-b border-separator px-3 text-callout text-label-secondary"
      >
        <span>Search:</span>
        <UiSegmented v-model="finder.scope" :options="scopeOptions" label="Search scope" />
      </div>

      <div
        ref="content"
        class="content relative min-h-0 flex-1 outline-none"
        :class="finder.viewMode === 'gallery' && !state ? 'overflow-hidden' : 'overflow-y-auto'"
        role="listbox"
        tabindex="0"
        :aria-label="`${title} contents`"
        :aria-activedescendant="finder.selectedId ? `finder-item-${finder.selectedId}` : undefined"
        @pointerdown="focusContent"
      >
        <StateView
          v-if="state"
          :key="state + errorType"
          :state="state"
          :error-type="errorType"
          :query="finder.query"
          @retry="retry"
          @home="go('desktop')"
          @blame="actions.blameSomeone()"
          @clear="finder.setQuery('')"
        />
        <IconGrid
          v-else-if="finder.viewMode === 'icons'"
          ref="grid"
          :items="items"
          :selected-id="finder.selectedId"
          :icon-size="iconSize"
          :emphasized="emphasized"
          :tags-of="tagsOf"
          @select="finder.select"
          @open="openItem"
          @context="openMenu"
        />
        <ListTable
          v-else-if="finder.viewMode === 'list'"
          :items="items"
          :selected-id="finder.selectedId"
          :sort-key="finder.sortKey"
          :sort-dir="finder.sortDir"
          :emphasized="emphasized"
          :tags-of="tagsOf"
          @select="finder.select"
          @open="openItem"
          @sort="finder.setSort"
          @context="openMenu"
        />
        <GalleryView
          v-else
          :items="items"
          :selected-id="finder.selectedId"
          @select="finder.select"
          @open="openItem"
          @quicklook="showQuickLook"
          @context="openMenu"
        />
      </div>

      <nav class="chrome flex h-6 shrink-0 items-center gap-1 overflow-hidden border-t border-separator px-2" aria-label="Path">
        <template v-for="(crumb, i) in crumbs" :key="`${crumb.name}-${i}`">
          <ChevronRight v-if="i > 0" class="size-2.5 shrink-0 text-label-tertiary" aria-hidden="true" />
          <button
            type="button"
            class="crumb focus-ring flex min-w-0 items-center gap-1 rounded-sm px-1 text-subheadline"
            :disabled="!crumb.id"
            @click="crumb.id && go(crumb.id)"
          >
            <span class="size-3.5 shrink-0">
              <FileIcon :kind="i === crumbs.length - 1 && selected && !crumb.id ? selected.kind : 'folder'" :ext="i === crumbs.length - 1 && selected && !crumb.id ? selected.ext : ''" :emblem="crumb.id ? folderEmblem(crumb.id) : null" />
            </span>
            <span class="truncate">{{ crumb.name }}</span>
          </button>
        </template>
      </nav>
      <footer class="chrome flex h-6 shrink-0 items-center gap-3 border-t border-separator px-3 text-subheadline text-label-secondary">
        <span class="min-w-0 flex-1 truncate text-center"><IconText :text="status" /></span>
        <div v-if="finder.viewMode === 'icons' && !state" class="w-20 shrink-0">
          <UiSlider v-model="iconSize" label="Icon size" :min="40" :max="112" :step="8" />
        </div>
      </footer>
    </div>

    <QuickLook
      :item="quickLookItem"
      :can-navigate="items.length > 1"
      @close="quickLookOpen = false"
      @navigate="stepQuickLook"
      @open="(item) => (item.kind === 'folder' ? go(item.id) : (quickLookOpen = false))"
      @share="actions.share"
    />
    <InfoPanel
      :item="infoItem"
      :tag-colors="infoItem ? tagsOf(infoItem) : []"
      @close="infoItem = null"
      @open="(item) => ((infoItem = null), openItem(item))"
      @share="actions.share"
    />
    <FinderContextMenu
      v-if="menu"
      :x="menu.x"
      :y="menu.y"
      :item="menu.item"
      :item-tags="menu.item ? tagsOf(menu.item) : []"
      @action="onMenuAction"
      @tag="(color) => menu?.item && finder.toggleTag(menu.item.id, color)"
      @close="menu = null"
    />
  </div>
</template>

<style scoped>
.tag-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  box-shadow: inset 0 0 0 0.5px var(--edge-dark);
}
.view-group {
  background: var(--fill-quaternary);
}
.crumb {
  color: var(--label-secondary);
}
.crumb:not(:disabled):hover {
  background: var(--fill-tertiary);
  color: var(--label);
}
.crumb:not(:disabled):active {
  background: var(--fill-secondary);
}
.crumb:disabled {
  color: var(--label-secondary);
  cursor: default;
}
</style>
