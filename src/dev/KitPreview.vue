<script setup lang="ts">
import { ref, watchEffect } from 'vue'

import { BrandIcon, brands, Glyph, glyphs, type BrandName, type GlyphName } from '@/ui'
import { appIcons } from '@/ui/app-icons'

const appearance = ref<'dark' | 'light'>('dark')
const accent = ref('blue')
watchEffect(() => {
  document.documentElement.dataset.appearance = appearance.value
  if (accent.value === 'blue') delete document.documentElement.dataset.accent
  else document.documentElement.dataset.accent = accent.value
})

const glyphNames = Object.keys(glyphs) as GlyphName[]
const brandNames = Object.keys(brands) as BrandName[]
const accents = ['blue', 'purple', 'pink', 'red', 'orange', 'yellow', 'green', 'graphite']
const system = ['red', 'orange', 'yellow', 'green', 'mint', 'teal', 'cyan', 'blue', 'indigo', 'purple', 'pink', 'brown', 'gray']
const labels = ['label', 'label-secondary', 'label-tertiary', 'label-quaternary']
const surfaces = ['window', 'window-content', 'window-toolbar', 'under-page', 'selection', 'selection-unemphasized', 'fill', 'fill-secondary']
const materials = ['material-menu', 'material-popover', 'material-sidebar', 'material-dock', 'material-notification', 'material-widget', 'material-hud']
</script>

<template>
  <div class="kit h-full overflow-auto p-8 text-label">
    <header class="mb-8 flex items-center gap-4">
      <h1 class="text-large-title">SatyajitOS kit</h1>
      <button class="rounded-control bg-fill px-3 py-1 text-body" @click="appearance = appearance === 'dark' ? 'light' : 'dark'">
        {{ appearance }}
      </button>
      <select v-model="accent" class="rounded-control bg-fill px-2 py-1 text-body">
        <option v-for="a in accents" :key="a" :value="a">{{ a }}</option>
      </select>
    </header>

    <section class="mb-10">
      <h2 class="mb-4 text-title-2">App icons</h2>
      <div class="flex flex-wrap items-end gap-8">
        <div v-for="(icon, name) in appIcons" :key="name" class="flex flex-col items-center gap-2">
          <component :is="icon" class="size-32 drop-shadow-xl" />
          <div class="flex items-end gap-3">
            <component :is="icon" class="size-16" />
            <component :is="icon" class="size-8" />
            <component :is="icon" class="size-4" />
          </div>
          <span class="text-callout text-label-secondary">{{ name }}</span>
        </div>
      </div>
    </section>

    <section class="mb-10">
      <h2 class="mb-4 text-title-2">Brand logos (svgl)</h2>
      <div class="flex flex-wrap gap-5">
        <div v-for="b in brandNames" :key="b" class="flex w-20 flex-col items-center gap-1 text-label">
          <BrandIcon :name="b" :size="32" />
          <span class="text-footnote text-label-secondary">{{ b }}</span>
        </div>
      </div>
    </section>

    <section class="mb-10">
      <h2 class="mb-4 text-title-2">Glyphs</h2>
      <div class="flex flex-wrap gap-3 text-title-2">
        <span v-for="n in glyphNames" :key="n" :title="n"><Glyph :name="n" /></span>
      </div>
    </section>

    <section class="mb-10">
      <h2 class="mb-4 text-title-2">System colours</h2>
      <div class="flex flex-wrap gap-3">
        <div v-for="c in system" :key="c" class="flex flex-col items-center gap-1">
          <div class="size-12 rounded-lg" :style="{ background: `var(--sys-${c})` }" />
          <span class="text-footnote text-label-secondary">{{ c }}</span>
        </div>
      </div>
    </section>

    <section class="mb-10 grid grid-cols-2 gap-8">
      <div>
        <h2 class="mb-4 text-title-2">Labels</h2>
        <p v-for="l in labels" :key="l" class="text-title-3" :style="{ color: `var(--${l})` }">{{ l }} — The quick brown fox</p>
      </div>
      <div>
        <h2 class="mb-4 text-title-2">Surfaces</h2>
        <div class="flex flex-wrap gap-3">
          <div v-for="s in surfaces" :key="s" class="flex w-28 flex-col gap-1">
            <div class="h-10 rounded-md shadow-control" :style="{ background: `var(--${s})` }" />
            <span class="text-footnote text-label-secondary">{{ s }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="mb-10">
      <h2 class="mb-4 text-title-2">Materials over wallpaper</h2>
      <div class="wall grid grid-cols-4 gap-6 rounded-window p-8">
        <div v-for="m in materials" :key="m" :class="m" class="flex h-24 items-center justify-center rounded-popover text-headline">
          {{ m }}
        </div>
      </div>
    </section>

    <section>
      <h2 class="mb-4 text-title-2">Type scale</h2>
      <p class="text-large-title">Large Title 26</p>
      <p class="text-title-1">Title 1 22</p>
      <p class="text-title-2">Title 2 17</p>
      <p class="text-title-3">Title 3 15</p>
      <p class="text-headline">Headline 13</p>
      <p class="text-body">Body 13 — Satyajit builds products people actually use.</p>
      <p class="text-callout">Callout 12</p>
      <p class="text-subheadline">Subheadline 11</p>
      <p class="text-footnote">Footnote 10</p>
      <p class="mt-4 font-mono text-callout">font-mono: satyajit@SatyajitOS ~ % whoami</p>
    </section>
  </div>
</template>

<style scoped>
.kit {
  background: var(--window-content);
}
.wall {
  background: url('@/assets/wallpapers/horizon-dark.webp') center / cover;
}
:root[data-appearance='light'] .wall {
  background-image: url('@/assets/wallpapers/horizon-light.webp');
}
</style>
