<script setup lang="ts">
import { useId } from 'vue'

import { trashArt } from './trashPalette'

/** A frosted wire-mesh bin, drawn on the same 100×100 grid as the app icons. */
const id = useId()
const ribs = [30, 40, 50, 60, 70]
</script>

<template>
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <defs>
      <linearGradient :id="`${id}-glass`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="trashArt.glassTop" stop-opacity="0.92" />
        <stop offset="1" :stop-color="trashArt.glassBottom" stop-opacity="0.92" />
      </linearGradient>
    </defs>
    <path d="M20 22h60l-6.5 68a5 5 0 0 1-5 4.5h-37a5 5 0 0 1-5-4.5z" :fill="`url(#${id}-glass)`" />
    <path d="M22 26h56l-.6 6H22.6z" :fill="trashArt.inner" opacity="0.35" />
    <g :stroke="trashArt.rib" stroke-width="1.6" opacity="0.7">
      <line v-for="x in ribs" :key="x" :x1="x" y1="28" :x2="50 + (x - 50) * 0.8" y2="92" />
    </g>
    <rect x="16" y="15" width="68" height="9" rx="4.5" :fill="trashArt.rim" />
    <rect x="16" y="15" width="68" height="9" rx="4.5" fill="none" :stroke="trashArt.rimShade" stroke-width="1" />
  </svg>
</template>
