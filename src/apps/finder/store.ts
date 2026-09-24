import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { TagColor } from '@/content/files'
import { tags } from '@/content/files'

import {
  locationExists,
  parentOf,
  resolveLocation,
  searchItems,
  sortItems,
  type Item,
  type SortKey,
} from './fs'

export type ViewMode = 'icons' | 'list' | 'gallery'
export type SearchScope = 'all' | 'here'

export const HOME_LOCATION = 'desktop'

/**
 * Finder's browsing state: a back/forward history of location ids (folders,
 * smart folders, tags), the selection, the view, sorting and search.
 */
export const useFinderStore = defineStore('finder', () => {
  const history = ref<string[]>([HOME_LOCATION])
  const historyIndex = ref(0)
  const selectedId = ref<string | null>(null)
  const viewMode = ref<ViewMode>('icons')
  const sortKey = ref<SortKey>('name')
  const sortDir = ref<1 | -1>(1)
  const query = ref('')
  const scope = ref<SearchScope>('all')
  /** Tags added from the context menu this session, by item id. */
  const addedTags = ref<Record<string, string[]>>({})

  const currentId = computed(() => history.value[historyIndex.value] ?? HOME_LOCATION)
  const location = computed(() => resolveLocation(currentId.value) ?? resolveLocation(HOME_LOCATION)!)
  const isSearching = computed(() => query.value.trim().length > 0)

  const items = computed<Item[]>(() => {
    const source = isSearching.value
      ? searchItems(query.value, scope.value === 'here' ? location.value.items : undefined)
      : location.value.items
    return sortItems(source, sortKey.value, sortDir.value)
  })

  const selected = computed(() => items.value.find((item) => item.id === selectedId.value) ?? null)
  const canGoBack = computed(() => historyIndex.value > 0)
  const canGoForward = computed(() => historyIndex.value < history.value.length - 1)

  /** Go to a location. Returns false for ids that don't resolve. */
  function open(id: string): boolean {
    if (!locationExists(id)) return false
    query.value = ''
    if (id === currentId.value) return true
    history.value = [...history.value.slice(0, historyIndex.value + 1), id]
    historyIndex.value = history.value.length - 1
    selectedId.value = null
    return true
  }

  function back() {
    if (!canGoBack.value) return
    historyIndex.value--
    selectedId.value = null
    query.value = ''
  }

  function forward() {
    if (!canGoForward.value) return
    historyIndex.value++
    selectedId.value = null
    query.value = ''
  }

  /** ⌘↑: open the enclosing folder and select the one we came from. */
  function openEnclosing(): boolean {
    const from = currentId.value
    const parent = parentOf(from)
    if (!parent || !open(parent)) return false
    selectedId.value = from
    return true
  }

  function select(id: string | null) {
    selectedId.value = id
  }

  /** Move the selection by `delta` positions (a whole row in the icon grid). */
  function moveSelection(delta: number) {
    const list = items.value
    if (!list.length) return
    const index = list.findIndex((item) => item.id === selectedId.value)
    const next = index === -1 ? (delta > 0 ? 0 : list.length - 1) : Math.min(Math.max(index + delta, 0), list.length - 1)
    selectedId.value = list[next]!.id
  }

  /** Finder's type-select: jump to the first item starting with what was typed. */
  function selectByPrefix(prefix: string): boolean {
    const p = prefix.toLowerCase()
    const hit = items.value.find((item) => item.name.toLowerCase().startsWith(p))
    if (hit) selectedId.value = hit.id
    return !!hit
  }

  function setView(mode: ViewMode) {
    viewMode.value = mode
  }

  /** Click a column header: same column flips the direction, a new one starts ascending. */
  function setSort(key: SortKey) {
    if (sortKey.value === key) sortDir.value = sortDir.value === 1 ? -1 : 1
    else {
      sortKey.value = key
      sortDir.value = 1
    }
  }

  function setQuery(value: string) {
    query.value = value
    selectedId.value = null
  }

  function toggleTag(itemId: string, color: TagColor) {
    const tag = tags.find((t) => t.color === color)?.matches[0]
    if (!tag) return
    const current = addedTags.value[itemId] ?? []
    addedTags.value = {
      ...addedTags.value,
      [itemId]: current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
    }
  }

  /** Back to a fresh window on `id` (Desktop by default). */
  function reset(id: string = HOME_LOCATION) {
    const start = locationExists(id) ? id : HOME_LOCATION
    history.value = [start]
    historyIndex.value = 0
    selectedId.value = null
    query.value = ''
  }

  return {
    history,
    historyIndex,
    currentId,
    location,
    items,
    selectedId,
    selected,
    viewMode,
    sortKey,
    sortDir,
    query,
    scope,
    addedTags,
    isSearching,
    canGoBack,
    canGoForward,
    open,
    back,
    forward,
    openEnclosing,
    select,
    moveSelection,
    selectByPrefix,
    setView,
    setSort,
    setQuery,
    toggleTag,
    reset,
  }
})
