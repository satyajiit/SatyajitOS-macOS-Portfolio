<script setup lang="ts">
import { apps, type AppId } from '@/apps/registry'
import { useWindowsStore } from '@/stores/windows'
import UiAppIcon from '@/ui/UiAppIcon.vue'

import { shellUi } from '../shellUi'

/**
 * Icons on the desktop, top-right like a Mac's mounted drives and files.
 * Click selects, double-click (or Return) opens, arrow keys move selection.
 */
const windows = useWindowsStore()
const items = apps.filter((app) => app.desktopIcon && app.desktop)

function select(id: AppId) {
  shellUi.selectedIcon = id
}

function openApp(id: AppId) {
  shellUi.selectedIcon = id
  windows.open(id)
}

function move(from: number, delta: number, event: KeyboardEvent) {
  const next = items[from + delta]
  if (!next) return
  shellUi.selectedIcon = next.id
  const buttons = (event.currentTarget as HTMLElement).parentElement?.parentElement?.querySelectorAll('button')
  buttons?.[from + delta]?.focus()
}
</script>

<template>
  <ul class="icons chrome fixed flex flex-col gap-1" aria-label="Desktop">
    <li v-for="(app, i) in items" :key="app.id">
      <button
        type="button"
        class="item"
        :aria-pressed="shellUi.selectedIcon === app.id"
        :aria-label="`${app.name}. Double-click to open.`"
        @click.stop="select(app.id)"
        @dblclick="openApp(app.id)"
        @keydown.enter.prevent="openApp(app.id)"
        @keydown.down.prevent="move(i, 1, $event)"
        @keydown.up.prevent="move(i, -1, $event)"
      >
        <span class="art">
          <UiAppIcon :name="app.icon" :size="64" :badge="app.badge?.() ?? 0" />
        </span>
        <span class="label text-callout text-white">{{ app.name }}</span>
      </button>
    </li>
  </ul>
</template>

<style scoped>
.icons {
  top: calc(var(--menubar-height) + 14px);
  right: 14px;
  z-index: var(--z-desktop-icons);
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  width: 92px;
  padding: 4px 0;
  cursor: default;
}

.art {
  padding: 5px;
  border-radius: 10px;
}

.label {
  max-width: 88px;
  padding: 0 5px;
  border-radius: 4px;
  font-weight: 500;
  text-align: center;
  text-shadow: var(--elev-text-desktop);
  overflow-wrap: anywhere;
}

.item:hover .art {
  background: var(--fill-quaternary);
}
.item:active .art {
  background: var(--fill-secondary);
}
.item[aria-pressed='true'] .art {
  background: var(--fill);
  box-shadow: inset 0 0 0 1px var(--fill-secondary);
}
.item[aria-pressed='true'] .label {
  background: var(--selection);
  color: var(--label-on-accent);
  text-shadow: none;
}
.item:focus-visible {
  outline: none;
}
.item:focus-visible .art {
  outline: 3px solid var(--focus-ring);
}
</style>
