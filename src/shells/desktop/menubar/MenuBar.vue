<script setup lang="ts">
import { Lock, Moon, Wifi, WifiHigh, WifiLow, WifiOff, WifiZero } from '@lucide/vue'
import { onClickOutside } from '@vueuse/core'
import { computed, nextTick, ref } from 'vue'

import { useClock } from '@/composables/useClock'
import { useSystemStatusStore } from '@/stores/systemStatus'
import UiMenu from '@/ui/UiMenu.vue'
import UiMenuItem from '@/ui/UiMenuItem.vue'
import UiMenuSeparator from '@/ui/UiMenuSeparator.vue'
import UiSwitch from '@/ui/UiSwitch.vue'

import BrandGlyph from '../BrandGlyph.vue'
import { closeMenus, shellUi, togglePanel } from '../shellUi'
import BatteryGlyph from './BatteryGlyph.vue'
import ControlCenterGlyph from './ControlCenterGlyph.vue'
import type { MenuAction } from './types'
import { useMenus } from './useMenus'

/**
 * The menu bar. Click a title to open its menu; while one is open, hovering
 * another title switches to it (as on a real Mac). Status items on the right
 * open their own menus or the Control Center / Notification Center panels.
 */
const { menus } = useMenus()
const status = useSystemStatusStore()
const clock = useClock()

const header = ref<HTMLElement | null>(null)
const dropdown = ref<HTMLElement | null>(null)
const anchors = new Map<string, HTMLElement>()
const position = ref<{ left?: number; right?: number }>({})

const STATUS_MENUS = ['wifi', 'battery'] as const
const menuIds = computed(() => [...menus.value.map((m) => m.id), ...STATUS_MENUS])
const openTop = computed(() => menus.value.find((m) => m.id === shellUi.openMenu) ?? null)
const isMenuOpen = computed(() => !!shellUi.openMenu && menuIds.value.includes(shellUi.openMenu))

function setAnchor(id: string) {
  return (el: unknown) => {
    if (el instanceof HTMLElement) anchors.set(id, el)
  }
}

function measure(id: string) {
  const rect = anchors.get(id)?.getBoundingClientRect()
  if (!rect) return
  position.value = (STATUS_MENUS as readonly string[]).includes(id)
    ? { right: Math.max(6, window.innerWidth - rect.right - 6) }
    : { left: Math.max(4, rect.left - 6) }
}

function open(id: string, viaKeyboard = false) {
  measure(id)
  shellUi.openMenu = id
  shellUi.openedWithKeyboard = viaKeyboard
}

function onTitleClick(id: string, event: MouseEvent) {
  // detail === 0 means the click came from Enter/Space, so focus the first item.
  if (shellUi.openMenu === id) closeMenus()
  else open(id, event.detail === 0)
}

function onTitleHover(id: string) {
  if (isMenuOpen.value && shellUi.openMenu !== id) open(id, false)
}

async function closeAndRefocus() {
  const id = shellUi.openMenu
  closeMenus()
  await nextTick()
  if (id) anchors.get(id)?.focus()
}

function switchMenu(direction: 1 | -1) {
  const ids = menuIds.value
  const i = ids.indexOf(shellUi.openMenu ?? '')
  if (i === -1) return
  open(ids[(i + direction + ids.length) % ids.length]!, true)
}

function run(entry: MenuAction) {
  closeMenus()
  entry.action?.()
}

onClickOutside(dropdown, (event) => {
  if (header.value?.contains(event.target as Node)) return
  if (isMenuOpen.value) closeMenus()
})

const WifiIcon = computed(() => {
  if (status.wifiStatus === 'disconnected') return WifiOff
  if (status.wifiStatus === 'connecting') return WifiZero
  return [WifiLow, WifiLow, WifiHigh, Wifi][status.wifiBars] ?? Wifi
})
const batteryPct = computed(() => Math.round(status.batteryLevel))
</script>

<template>
  <header
    ref="header"
    class="menubar material-menubar chrome fixed inset-x-0 top-0 flex h-(--menubar-height) items-center justify-between px-2 text-body text-label"
    data-menubar
  >
    <nav class="flex min-w-0 items-center" aria-label="Menu bar">
      <button
        v-for="menu in menus"
        :key="menu.id"
        :ref="setAnchor(menu.id)"
        type="button"
        class="mb-item"
        :class="{ 'font-bold': menu.bold, 'is-brand': menu.brand }"
        :aria-label="menu.brand ? `${menu.label} menu` : undefined"
        aria-haspopup="menu"
        :aria-expanded="shellUi.openMenu === menu.id"
        @click="onTitleClick(menu.id, $event)"
        @pointerenter="onTitleHover(menu.id)"
        @keydown.down.prevent="open(menu.id, true)"
      >
        <BrandGlyph v-if="menu.brand" class="size-[15px]" />
        <span v-else class="truncate">{{ menu.label }}</span>
      </button>
    </nav>

    <div class="flex shrink-0 items-center">
      <button
        v-if="status.focusMode !== 'off'"
        type="button"
        class="mb-item"
        aria-label="Focus is on"
        @click="togglePanel('control-center')"
      >
        <Moon class="size-[15px]" />
      </button>
      <button
        :ref="setAnchor('battery')"
        type="button"
        class="mb-item gap-1.5"
        :aria-label="`Battery ${batteryPct}%`"
        aria-haspopup="menu"
        :aria-expanded="shellUi.openMenu === 'battery'"
        @click="onTitleClick('battery', $event)"
        @pointerenter="onTitleHover('battery')"
      >
        <span class="tabular">{{ batteryPct }}%</span>
        <BatteryGlyph :level="status.batteryLevel" :charging="status.isCharging" />
      </button>
      <button
        :ref="setAnchor('wifi')"
        type="button"
        class="mb-item"
        aria-label="Wi-Fi"
        aria-haspopup="menu"
        :aria-expanded="shellUi.openMenu === 'wifi'"
        @click="onTitleClick('wifi', $event)"
        @pointerenter="onTitleHover('wifi')"
      >
        <component
          :is="WifiIcon"
          class="size-[17px]"
          :class="{ 'animate-pulse': status.wifiStatus === 'connecting' }"
        />
      </button>
      <button
        type="button"
        class="mb-item"
        aria-label="Control Center"
        :aria-expanded="shellUi.openMenu === 'control-center'"
        data-panel-toggle="control-center"
        @click="togglePanel('control-center')"
      >
        <ControlCenterGlyph />
      </button>
      <button
        type="button"
        class="mb-item tabular"
        :aria-label="`${clock.longDate.value}, ${clock.time.value}. Notification Center`"
        :aria-expanded="shellUi.openMenu === 'notification-center'"
        data-panel-toggle="notification-center"
        @click="togglePanel('notification-center')"
      >
        <span>{{ clock.menuDate.value }}</span>
        <span class="ml-2">{{ clock.time.value }}</span>
      </button>
    </div>
  </header>

  <div
    v-if="isMenuOpen"
    ref="dropdown"
    class="dropdown fixed"
    :style="{ left: position.left !== undefined ? `${position.left}px` : undefined, right: position.right !== undefined ? `${position.right}px` : undefined }"
    @keydown.left.prevent="switchMenu(-1)"
    @keydown.right.prevent="switchMenu(1)"
  >
    <UiMenu
      v-if="openTop"
      :key="openTop.id"
      :label="openTop.label"
      :autofocus="shellUi.openedWithKeyboard"
      @close="closeAndRefocus"
    >
      <template v-for="(entry, i) in openTop.entries" :key="i">
        <UiMenuSeparator v-if="entry.kind === 'separator'" />
        <UiMenuItem
          v-else
          :shortcut="entry.shortcut"
          :disabled="entry.disabled"
          :checked="entry.checked"
          :destructive="entry.destructive"
          @select="run(entry)"
        >
          {{ entry.label }}
        </UiMenuItem>
      </template>
    </UiMenu>

    <UiMenu
      v-else-if="shellUi.openMenu === 'wifi'"
      key="wifi"
      label="Wi-Fi"
      class="w-[260px]"
      :autofocus="shellUi.openedWithKeyboard"
      @close="closeAndRefocus"
    >
      <div class="flex items-center justify-between px-2.5 py-1">
        <span class="text-headline">Wi-Fi</span>
        <UiSwitch
          :model-value="status.wifiStatus !== 'disconnected'"
          label="Wi-Fi"
          @update:model-value="status.toggleWifi()"
        />
      </div>
      <UiMenuSeparator />
      <p class="px-2.5 pb-0.5 pt-1 text-subheadline font-semibold text-label-tertiary">
        {{ status.wifiStatus === 'connecting' ? 'Connecting…' : 'Known Networks' }}
      </p>
      <UiMenuItem
        v-for="network in status.networks"
        :key="network.name"
        :checked="network.isConnected"
        :disabled="status.wifiStatus === 'disconnected'"
        @select="status.connectToWifi(network.name)"
      >
        {{ network.name }}
        <template v-if="network.isSecure" #icon><Lock /></template>
      </UiMenuItem>
    </UiMenu>

    <UiMenu
      v-else-if="shellUi.openMenu === 'battery'"
      key="battery"
      label="Battery"
      class="w-[260px]"
      :autofocus="shellUi.openedWithKeyboard"
      @close="closeAndRefocus"
    >
      <div class="flex items-center justify-between px-2.5 py-1">
        <span class="text-headline">Battery</span>
        <span class="tabular text-body text-label-secondary">{{ batteryPct }}%</span>
      </div>
      <p class="px-2.5 text-body text-label-secondary">
        Power Source: {{ status.isCharging ? 'Power Adapter' : 'Battery' }}
      </p>
      <p class="px-2.5 pb-1 text-body text-label-secondary">
        {{ status.isCharging ? status.batteryTimeRemaining : `${status.batteryTimeRemaining} remaining` }}
      </p>
      <UiMenuSeparator />
      <UiMenuItem :checked="status.powerSavingMode" @select="status.togglePowerSaving()">
        Low Power Mode
      </UiMenuItem>
      <UiMenuItem @select="status.toggleCharging()">
        {{ status.isCharging ? 'Unplug Charger' : 'Plug In Charger' }}
      </UiMenuItem>
    </UiMenu>
  </div>
</template>

<style scoped>
.menubar {
  z-index: var(--z-menubar);
}

.mb-item {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 5px;
  white-space: nowrap;
  color: inherit;
  cursor: default;
}
.mb-item.is-brand {
  padding: 0 10px;
}
.mb-item:hover {
  background: var(--fill-quaternary);
}
.mb-item[aria-expanded='true'],
.mb-item:active {
  background: var(--fill-secondary);
}
.mb-item:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: -1px;
}

/* Open menus sit above notification banners, as on macOS. */
.dropdown {
  top: calc(var(--menubar-height) + 2px);
  z-index: var(--z-menus);
}
</style>
