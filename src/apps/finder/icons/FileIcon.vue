<script setup lang="ts">
import { computed, useId } from 'vue'

import type { FileKind } from '../fs'

import { fileArt as art } from './palette'

/**
 * macOS-style file icon on a 64×64 canvas: blue folders (with an engraved
 * emblem for special ones), paper documents with a folded corner and a
 * coloured type label, and a few object-shaped icons (movie, disk, package).
 */
export type FolderEmblem = 'desktop' | 'documents' | 'downloads' | 'home' | 'smart' | 'coffee' | 'image' | 'lock'

const props = withDefaults(defineProps<{ kind: FileKind; ext?: string; emblem?: FolderEmblem | null }>(), {
  ext: '',
  emblem: null,
})

const id = useId()
const smart = computed(() => props.emblem === 'smart')

const LABEL_COLORS: Record<string, string> = {
  docx: art.word,
  csv: art.excel,
  xlsx: art.excel,
  pptx: art.powerpoint,
  pdf: art.pdf,
  md: art.markdown,
  txt: art.text,
  sketch: art.sketch,
}

const label = computed(() => (props.ext ? props.ext.toUpperCase().slice(0, 5) : ''))
const labelColor = computed(() => {
  if (props.kind === 'code') return art.code
  return LABEL_COLORS[props.ext] ?? art.unknown
})
const isPaper = computed(() =>
  ['spreadsheet', 'document', 'presentation', 'pdf', 'markdown', 'text', 'code', 'design', 'unknown'].includes(
    props.kind,
  ),
)
</script>

<template>
  <svg viewBox="0 0 64 64" aria-hidden="true" class="file-icon">
    <defs>
      <linearGradient :id="`${id}-back`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="smart ? art.smartBackTop : art.folderBackTop" />
        <stop offset="1" :stop-color="smart ? art.smartBackBottom : art.folderBackBottom" />
      </linearGradient>
      <linearGradient :id="`${id}-front`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="smart ? art.smartFrontTop : art.folderFrontTop" />
        <stop offset="1" :stop-color="smart ? art.smartFrontBottom : art.folderFrontBottom" />
      </linearGradient>
      <linearGradient :id="`${id}-paper`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="art.paperTop" />
        <stop offset="1" :stop-color="art.paperBottom" />
      </linearGradient>
      <linearGradient :id="`${id}-fold`" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" :stop-color="art.foldTop" />
        <stop offset="1" :stop-color="art.foldBottom" />
      </linearGradient>
      <linearGradient :id="`${id}-sky`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="art.skyDeep" />
        <stop offset="1" :stop-color="art.sky" />
      </linearGradient>
      <linearGradient :id="`${id}-drive`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="art.driveTop" />
        <stop offset="1" :stop-color="art.driveBottom" />
      </linearGradient>
      <linearGradient :id="`${id}-pkg`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="art.packageTop" />
        <stop offset="1" :stop-color="art.packageBottom" />
      </linearGradient>
      <filter :id="`${id}-drop`" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="1" stdDeviation="1" :flood-color="art.shadow" flood-opacity="0.22" />
      </filter>
    </defs>

    <!-- Folder -->
    <g v-if="kind === 'folder'" :filter="`url(#${id}-drop)`">
      <path
        d="M9 12h13.2c1.3 0 2.5.6 3.3 1.6l2.2 2.6H55a4 4 0 0 1 4 4V50a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z"
        :fill="`url(#${id}-back)`"
      />
      <path
        d="M5 23.5A3.5 3.5 0 0 1 8.5 20h47a3.5 3.5 0 0 1 3.5 3.5V50a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"
        :fill="`url(#${id}-front)`"
      />
      <path d="M8.5 20.6h47" :stroke="art.folderEdge" stroke-width="1" stroke-linecap="round" opacity="0.8" />
      <g
        v-if="emblem"
        fill="none"
        :stroke="smart ? art.smartEmblem : art.folderEmblem"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
        opacity="0.85"
      >
        <template v-if="emblem === 'desktop'">
          <rect x="24.5" y="30.5" width="15" height="10" rx="1.5" />
          <path d="M32 40.5v3.5M28 44h8" />
        </template>
        <template v-else-if="emblem === 'documents'">
          <path d="M27.5 29.5h6l3.5 3.5v12h-9.5z" />
          <path d="M33.5 29.5V33h3.5M30 37h4.5M30 40.5h4.5" />
        </template>
        <template v-else-if="emblem === 'downloads'">
          <circle cx="32" cy="37" r="7.5" />
          <path d="M32 32.5v8M28.8 37.8 32 41l3.2-3.2" />
        </template>
        <template v-else-if="emblem === 'home'">
          <path d="M25 37.5 32 31l7 6.5M27 36v8h10v-8" />
        </template>
        <template v-else-if="emblem === 'smart'">
          <circle cx="32" cy="37" r="3" />
          <path
            d="M32 29.5v2.2M32 42.3v2.2M24.5 37h2.2M37.3 37h2.2M26.7 31.7l1.6 1.6M35.7 40.7l1.6 1.6M26.7 42.3l1.6-1.6M35.7 33.3l1.6-1.6"
          />
        </template>
        <template v-else-if="emblem === 'coffee'">
          <path d="M26 33h10v5.5a4.5 4.5 0 0 1-4.5 4.5h-1a4.5 4.5 0 0 1-4.5-4.5z" />
          <path d="M36 35h1.2a2.3 2.3 0 0 1 0 4.6H36" />
        </template>
        <template v-else-if="emblem === 'image'">
          <rect x="24.5" y="31" width="15" height="12" rx="1.5" />
          <path d="m25 41 4.5-4.5 3.5 3.5 2-2 4 4" />
        </template>
        <template v-else-if="emblem === 'lock'">
          <rect x="26.5" y="35" width="11" height="8.5" rx="1.5" />
          <path d="M29 35v-2.5a3 3 0 0 1 6 0V35" />
        </template>
      </g>
    </g>

    <!-- Paper documents -->
    <g v-else-if="isPaper" :filter="`url(#${id}-drop)`">
      <path
        d="M17 5h21.5L50 16.5V56a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z"
        :fill="`url(#${id}-paper)`"
        :stroke="art.paperEdge"
        stroke-width="0.6"
      />
      <path d="M38.5 5 50 16.5h-8.5a3 3 0 0 1-3-3z" :fill="`url(#${id}-fold)`" :stroke="art.paperEdge" stroke-width="0.6" />

      <g v-if="kind === 'spreadsheet'">
        <rect x="19" y="21" width="26" height="19" rx="1.2" :fill="art.excelSoft" :stroke="art.excel" stroke-width="0.8" />
        <path d="M19 25.8h26M19 30.5h26M19 35.2h26M27.7 21v19M36.3 21v19" :stroke="art.excel" stroke-width="0.6" opacity="0.7" />
      </g>
      <g v-else-if="kind === 'presentation'">
        <rect x="18.5" y="22" width="27" height="17" rx="1.5" :fill="art.powerpointSoft" :stroke="art.powerpoint" stroke-width="0.8" />
        <path d="M24 35v-4M29 35v-7M34 35v-5.5M39 35v-9" :stroke="art.powerpoint" stroke-width="2.2" stroke-linecap="round" />
      </g>
      <g v-else-if="kind === 'code'" fill="none" :stroke="art.code" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <path d="m25.5 26.5-6 5.5 6 5.5M38.5 26.5l6 5.5-6 5.5M34 24l-4 16" />
      </g>
      <g v-else-if="kind === 'design'">
        <path d="m32 22 9 7-9 12-9-12z" :fill="art.sketchSoft" :stroke="art.sketch" stroke-width="1.2" stroke-linejoin="round" />
        <path d="M23 29h18M28 22.5 32 29l4-6.5M32 29v12" :stroke="art.sketch" stroke-width="0.8" fill="none" />
      </g>
      <g v-else-if="kind === 'unknown'">
        <text x="32" y="39" text-anchor="middle" font-size="18" font-weight="700" :fill="art.lineDark" class="art-text">?</text>
      </g>
      <g v-else>
        <rect v-if="kind === 'pdf'" x="19" y="20" width="26" height="4" rx="1" :fill="art.pdf" opacity="0.85" />
        <text v-if="kind === 'markdown'" x="19" y="25" font-size="7" font-weight="700" :fill="art.markdown" class="art-text">#</text>
        <rect
          v-for="(w, i) in [26, 26, 22, 26, 18, 24]"
          :key="i"
          :x="kind === 'markdown' && i === 0 ? 25 : 19"
          :y="(kind === 'pdf' ? 27 : 21) + i * 3.6"
          :width="kind === 'markdown' && i === 0 ? w - 6 : w"
          height="1.6"
          rx="0.8"
          :fill="art.line"
        />
      </g>

      <text
        v-if="label"
        x="32"
        y="53.5"
        text-anchor="middle"
        font-size="6.4"
        font-weight="700"
        letter-spacing="0.2"
        :fill="labelColor"
        class="art-text"
      >
        {{ label }}
      </text>
    </g>

    <!-- Image -->
    <g v-else-if="kind === 'image'" :filter="`url(#${id}-drop)`">
      <rect x="7" y="13" width="50" height="38" rx="3" :fill="art.photoFrame" />
      <rect x="9.5" y="15.5" width="45" height="33" rx="1.5" :fill="`url(#${id}-sky)`" />
      <circle cx="44" cy="23.5" r="3.5" :fill="art.sun" />
      <path d="M9.5 48.5V40c6-6 11-7.5 17-2.5 5-5 11-6 17-1.5 4-2.5 7.5-2.8 11-1.5v14z" :fill="art.hill" />
      <path d="M9.5 48.5v-4c8-4 16-3 22 0 7-3 15-3.5 23-.5v4.5z" :fill="art.hillDeep" />
    </g>

    <!-- Movie -->
    <g v-else-if="kind === 'video'" :filter="`url(#${id}-drop)`">
      <rect x="6" y="14" width="52" height="36" rx="4" :fill="art.film" />
      <rect v-for="i in 7" :key="`t${i}`" :x="8.5 + (i - 1) * 7.2" y="16" width="4" height="3" rx="0.8" :fill="art.filmHole" />
      <rect v-for="i in 7" :key="`b${i}`" :x="8.5 + (i - 1) * 7.2" y="45" width="4" height="3" rx="0.8" :fill="art.filmHole" />
      <path d="M28 25.5v13l11-6.5z" :fill="art.play" />
    </g>

    <!-- Disk image -->
    <g v-else-if="kind === 'diskImage'" :filter="`url(#${id}-drop)`">
      <rect x="8" y="19" width="48" height="28" rx="6" :fill="`url(#${id}-drive)`" :stroke="art.driveStripe" stroke-width="0.6" />
      <path d="M8.5 38h47" :stroke="art.driveStripe" stroke-width="0.8" />
      <circle cx="49" cy="42.5" r="1.4" :fill="art.driveLed" />
      <rect x="14" y="41.5" width="16" height="2" rx="1" :fill="art.driveStripe" />
    </g>

    <!-- App package -->
    <g v-else-if="kind === 'package'" :filter="`url(#${id}-drop)`">
      <rect x="9" y="9" width="46" height="46" rx="11" :fill="`url(#${id}-pkg)`" />
      <g fill="none" :stroke="art.white" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">
        <path d="M32 20.5 43 26.5v12L32 44.5 21 38.5v-12z" />
        <path d="M21 26.5 32 32.5l11-6M32 32.5v12" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.file-icon {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.art-text {
  font-family: var(--font-sans);
}
</style>
