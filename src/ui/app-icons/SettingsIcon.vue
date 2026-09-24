<script setup lang="ts">
import { useId } from 'vue'

import { art } from './palette'
import { SQUIRCLE_PATH } from './squircle'

const id = useId()
const GEAR =
  'M79 50L85.84 53.39L84.87 58.95L77.29 59.82L75.11 64.5L79.34 70.85L75.72 75.19L68.72 72.15L64.5 75.11L64.99 82.73L59.68 84.67L55.14 78.54L50 79L46.61 85.84L41.05 84.87L40.18 77.29L35.5 75.11L29.15 79.34L24.81 75.72L27.85 68.72L24.89 64.5L17.27 64.99L15.33 59.68L21.46 55.14L21 50L14.16 46.61L15.13 41.05L22.71 40.18L24.89 35.5L20.66 29.15L24.28 24.81L31.28 27.85L35.5 24.89L35.01 17.27L40.32 15.33L44.86 21.46L50 21L53.39 14.16L58.95 15.13L59.82 22.71L64.5 24.89L70.85 20.66L75.19 24.28L72.15 31.28L75.11 35.5L82.73 35.01L84.67 40.32L78.54 44.86Z'
</script>

<template>
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <defs>
      <linearGradient :id="`${id}-bg`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="art.steelTop" />
        <stop offset="1" :stop-color="art.steelBottom" />
      </linearGradient>
      <filter :id="`${id}-drop`" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" :flood-color="art.shadow" flood-opacity="0.3" />
      </filter>
    </defs>
    <path :d="SQUIRCLE_PATH" :fill="`url(#${id}-bg)`" />
    <g :filter="`url(#${id}-drop)`">
      <path :d="GEAR" :fill="art.gearFace" stroke-linejoin="round" />
    </g>
    <circle cx="50" cy="50" r="19" fill="none" :stroke="art.gearRing" stroke-width="3" />
    <circle cx="50" cy="50" r="8" :fill="art.steelBottom" />
    <path :d="SQUIRCLE_PATH" fill="none" :stroke="art.paper" stroke-opacity="0.22" stroke-width="0.6" />
  </svg>
</template>
