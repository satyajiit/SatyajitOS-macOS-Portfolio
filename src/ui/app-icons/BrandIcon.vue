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
        <stop offset="0" :stop-color="art.orangeTop" />
        <stop offset="1" :stop-color="art.orangeBottom" />
      </linearGradient>
      <filter :id="`${id}-glyph`" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" :flood-color="art.shadow" flood-opacity="0.22" />
      </filter>
    </defs>
    <path :d="SQUIRCLE_PATH" :fill="`url(#${id}-bg)`" />
    <path
      d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"
      transform="translate(20 19) scale(2.5)"
      :fill="art.paper"
      :stroke="art.paper"
      stroke-width="0.6"
      stroke-linejoin="round"
      :filter="`url(#${id}-glyph)`"
    />
    <path :d="SQUIRCLE_PATH" fill="none" :stroke="art.paper" stroke-opacity="0.28" stroke-width="0.6" />
  </svg>
</template>
