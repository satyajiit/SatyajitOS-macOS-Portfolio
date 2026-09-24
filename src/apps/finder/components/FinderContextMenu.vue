<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { tags, type TagColor } from '@/content/files'
import { UiMenu, UiMenuItem, UiMenuSeparator } from '@/ui'

import type { Item } from '../fs'
import { TAG_TOKENS } from '../locations'

export type ContextAction =
  | 'open'
  | 'quicklook'
  | 'info'
  | 'copy'
  | 'newFolder'
  | 'refresh'
  | 'hidden'
  | 'procrastinate'
  | 'blameIntern'
  | 'coffeeBreak'
  | 'panic'

/** Right-click menu for an item or the empty folder background. */
const props = defineProps<{ x: number; y: number; item: Item | null; itemTags: TagColor[] }>()
const emit = defineEmits<{ action: [action: ContextAction]; tag: [color: TagColor]; close: [] }>()

const root = ref<HTMLElement | null>(null)
const pos = ref({ left: props.x, top: props.y })

function onPointerDown(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) emit('close')
}

onMounted(() => {
  // Keep the menu on screen, flipping left/up near the edges like AppKit does.
  const rect = root.value?.getBoundingClientRect()
  if (rect) {
    pos.value = {
      left: props.x + rect.width > window.innerWidth - 8 ? Math.max(8, props.x - rect.width) : props.x,
      top: props.y + rect.height > window.innerHeight - 8 ? Math.max(8, props.y - rect.height) : props.y,
    }
  }
  document.addEventListener('pointerdown', onPointerDown, true)
  window.addEventListener('blur', close)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown, true)
  window.removeEventListener('blur', close)
})

function close() {
  emit('close')
}
function run(action: ContextAction) {
  emit('action', action)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div ref="root" class="context fixed" :style="{ left: `${pos.left}px`, top: `${pos.top}px` }">
      <UiMenu :label="item ? `Actions for ${item.name}` : 'Folder actions'" autofocus @close="close">
        <template v-if="item">
          <UiMenuItem shortcut="⌘O" @select="run('open')">Open</UiMenuItem>
          <UiMenuItem v-if="item.kind !== 'folder'" shortcut="Space" @select="run('quicklook')">
            Quick Look “{{ item.name.length > 28 ? `${item.name.slice(0, 26)}…` : item.name }}”
          </UiMenuItem>
          <UiMenuItem shortcut="⌘I" @select="run('info')">Get Info</UiMenuItem>
          <UiMenuSeparator />
          <UiMenuItem shortcut="⌘C" @select="run('copy')">Copy “{{ item.name.length > 28 ? `${item.name.slice(0, 26)}…` : item.name }}”</UiMenuItem>
          <div class="tags flex items-center gap-1.5 px-3 py-1.5" role="group" aria-label="Tags">
            <button
              v-for="tag in tags"
              :key="tag.color"
              type="button"
              role="menuitemcheckbox"
              class="tag focus-ring"
              :aria-checked="itemTags.includes(tag.color)"
              :aria-label="tag.name"
              :title="tag.name"
              :style="{ background: TAG_TOKENS[tag.color] }"
              @click="emit('tag', tag.color)"
            />
          </div>
          <UiMenuSeparator />
        </template>
        <UiMenuItem shortcut="⇧⌘N" @select="run('newFolder')">New Folder</UiMenuItem>
        <UiMenuItem shortcut="⌘R" @select="run('refresh')">Refresh</UiMenuItem>
        <UiMenuItem shortcut="⇧⌘." @select="run('hidden')">Show Hidden Files</UiMenuItem>
        <UiMenuSeparator />
        <UiMenuItem @select="run('procrastinate')">Procrastinate</UiMenuItem>
        <UiMenuItem @select="run('blameIntern')">Blame the Intern</UiMenuItem>
        <UiMenuItem @select="run('coffeeBreak')">Take Coffee Break</UiMenuItem>
        <UiMenuItem destructive @select="run('panic')">Enter Panic Mode</UiMenuItem>
      </UiMenu>
    </div>
  </Teleport>
</template>

<style scoped>
.context {
  z-index: var(--z-menus);
}
.tag {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  box-shadow: inset 0 0 0 0.5px var(--edge-dark);
  transition: transform var(--dur-micro) var(--ease-out);
}
.tag:hover {
  transform: scale(1.2);
}
.tag:active {
  transform: scale(0.95);
}
.tag[aria-checked='true'] {
  box-shadow:
    inset 0 0 0 0.5px var(--edge-dark),
    0 0 0 2px var(--window-content),
    0 0 0 3px var(--label-secondary);
}
</style>
