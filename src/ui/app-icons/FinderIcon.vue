<script setup lang="ts">
import { useId } from 'vue'

import { art } from './palette'
import { SQUIRCLE_PATH } from './squircle'

const id = useId()
</script>

<template>
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <defs>
      <linearGradient :id="`${id}-bg`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="art.paper" />
        <stop offset="1" :stop-color="art.paperShade" />
      </linearGradient>
      <linearGradient :id="`${id}-back`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="art.folderBackTop" />
        <stop offset="1" :stop-color="art.folderBack" />
      </linearGradient>
      <linearGradient :id="`${id}-front`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="art.folderFrontTop" />
        <stop offset="1" :stop-color="art.folderFrontBottom" />
      </linearGradient>
      <filter :id="`${id}-drop`" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" :flood-color="art.shadow" flood-opacity="0.18" />
      </filter>
    </defs>
    <path :d="SQUIRCLE_PATH" :fill="`url(#${id}-bg)`" />
    <g :filter="`url(#${id}-drop)`">
      <path
        d="M19 28h19.5c1.4 0 2.6.6 3.4 1.7l3.1 4.3H81a4 4 0 0 1 4 4V74a4 4 0 0 1-4 4H19a4 4 0 0 1-4-4V32a4 4 0 0 1 4-4z"
        :fill="`url(#${id}-back)`"
      />
      <rect x="15" y="40" width="70" height="38" rx="4" :fill="`url(#${id}-front)`" />
    </g>
    <!-- engraved face: a nod to the classic, not a copy of it -->
    <g :stroke="art.folderEngrave" stroke-width="2.4" stroke-linecap="round" fill="none" opacity="0.75">
      <path d="M41 51v6M59 51v6" />
      <path d="M39 64c6.5 5 15.5 5 22 0" />
    </g>
    <path :d="SQUIRCLE_PATH" fill="none" :stroke="art.shadow" stroke-opacity="0.08" stroke-width="0.6" />
  </svg>
</template>
