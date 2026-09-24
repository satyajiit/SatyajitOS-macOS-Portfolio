<script setup lang="ts">
import { computed, defineAsyncComponent, provide, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

import { getApp, type AppId } from '@/apps/registry'
import { usePlatform } from '@/composables/usePlatform'
import MacWindow from '@/shells/desktop/window/MacWindow.vue'
import { useAppearanceStore } from '@/stores/appearance'
import { useWindowsStore } from '@/stores/windows'
import { MOBILE_APP_CONTEXT } from '@/ui/mobile/context'
import wallpaperDark from '@/assets/wallpapers/horizon-dark.webp'
import wallpaperLight from '@/assets/wallpapers/horizon-light.webp'

/**
 * Dev-only: mount one app in isolation.
 *   /__app/finder                → inside a macOS window
 *   /__app/finder?shell=mobile   → inside a 390×844 phone viewport
 */
const route = useRoute()
const appearance = useAppearanceStore()
const windows = useWindowsStore()
const { shell } = usePlatform()

const id = computed(() => route.params.appId as AppId)
const app = computed(() => getApp(id.value))
const mobileView = computed(() =>
  app.value?.mobile ? defineAsyncComponent(app.value.mobile.component) : null,
)

watchEffect(() => {
  if (shell.value === 'desktop' && app.value?.desktop) windows.open(id.value)
})

provide(MOBILE_APP_CONTEXT, { close: () => console.info('[harness] close()') })

const wallpaper = computed(() => (appearance.isDark ? wallpaperDark : wallpaperLight))
</script>

<template>
  <div class="fixed inset-0 bg-cover bg-center" :style="{ backgroundImage: `url(${wallpaper})` }">
    <button
      class="absolute right-3 top-3 z-[99999] rounded-control bg-fill px-2 py-0.5 text-callout text-label material-menu"
      @click="appearance.toggleDark()"
    >
      {{ appearance.resolved }}
    </button>

    <template v-if="!app">
      <p class="p-8 text-title-2 text-label">Unknown app “{{ id }}”</p>
    </template>

    <template v-else-if="shell === 'desktop'">
      <MacWindow v-if="app.desktop && windows.isOpen(id)" :id="id" />
      <button
        v-else-if="app.desktop"
        class="absolute left-1/2 top-1/2 rounded-control bg-fill px-3 py-1 text-body text-label"
        @click="windows.open(id)"
      >
        Reopen {{ app.name }}
      </button>
      <p v-else class="p-8 text-title-2 text-label">{{ app.name }} has no desktop version.</p>
    </template>

    <div
      v-else
      class="absolute left-1/2 top-1/2 h-[844px] max-h-full w-[390px] max-w-full -translate-x-1/2 -translate-y-1/2 overflow-clip bg-ios-bg shadow-window"
      style="--ios-status-height: 54px; border-radius: 48px"
    >
      <component :is="mobileView" v-if="mobileView" />
      <p v-else class="p-8 text-ios-title-2 text-ios-label">{{ app.name }} has no mobile version.</p>
    </div>
  </div>
</template>
