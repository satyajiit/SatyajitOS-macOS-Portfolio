<script setup lang="ts">
import { Search } from '@lucide/vue'
import { useWindowSize } from '@vueuse/core'
import { computed } from 'vue'

import { mobileApps } from '@/apps/registry'
import { useMobileStore } from '@/stores/mobile'

import HomeIcon from './HomeIcon.vue'
import QuoteWidget from './QuoteWidget.vue'

/**
 * SpringBoard: widget, app grid, the Search pill and the Dock. Dock apps are
 * not repeated on the grid, as on a real iPhone.
 */
const store = useMobileStore()
const { width } = useWindowSize()

const dockApps = computed(() => mobileApps.filter((app) => app.mobileDock).slice(0, 4))
const gridApps = computed(() => mobileApps.filter((app) => !app.mobileDock))
/** 60px on a 390pt phone, scaling a little with the screen. */
const iconSize = computed(() => Math.round(Math.min(64, Math.max(52, Math.min(width.value, 440) * 0.154))))
</script>

<template>
  <main
    class="home absolute inset-0 flex flex-col"
    aria-label="Home Screen"
    @click.self="store.exitEditMode()"
  >
    <button
      v-if="store.isEditMode"
      type="button"
      class="done material-ios-platter focus-ring rounded-full px-4 text-ios-subheadline font-semibold text-ios-label"
      @click="store.exitEditMode()"
    >
      Done
    </button>

    <div class="page mx-auto w-full" @click.self="store.exitEditMode()">
      <div class="grid grid-cols-4 gap-y-6" :style="{ '--icon': `${iconSize}px` }">
        <div class="widget-slot col-span-4">
          <QuoteWidget />
        </div>
        <HomeIcon v-for="app in gridApps" :key="app.id" :app="app" :size="iconSize" />
      </div>
    </div>

    <div class="mt-auto flex flex-col items-center gap-4 pb-[max(env(safe-area-inset-bottom),12px)]">
      <button
        type="button"
        class="search-pill material-ios-platter focus-ring flex items-center gap-1.5 rounded-full px-3.5 text-ios-footnote font-semibold text-ios-label"
        @click="store.openPanel('search')"
      >
        <Search class="size-3.5" style="stroke-width: 2.6" aria-hidden="true" />
        Search
      </button>

      <nav class="dock material-ios-platter mx-auto w-[calc(100%-20px)]" aria-label="Dock">
        <HomeIcon v-for="app in dockApps" :key="app.id" :app="app" :size="iconSize" :label="false" />
      </nav>
    </div>
  </main>
</template>

<style scoped>
.home {
  padding-top: calc(var(--ios-status-height) + 14px);
}

.page {
  max-width: 440px;
  padding-inline: 20px;
}

/* A medium widget spans exactly from the first icon's left edge to the last icon's right edge. */
.widget-slot {
  margin-inline: calc((25% - var(--icon)) / 2);
}

.search-pill {
  height: 30px;
  transition: transform var(--dur-micro) var(--ease-out);
}
.search-pill:active {
  transform: scale(0.95);
}

.dock {
  max-width: 420px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  justify-items: center;
  padding: 16px 10px;
  border-radius: 34px;
}

.done {
  position: absolute;
  top: calc(var(--ios-status-height) + 4px);
  right: 16px;
  height: 30px;
  z-index: 1;
}
.done:active {
  opacity: 0.7;
}
</style>
