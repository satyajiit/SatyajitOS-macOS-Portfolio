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
        <stop offset="0" :stop-color="art.mist" />
        <stop offset="1" :stop-color="art.mistDeep" />
      </linearGradient>
      <linearGradient :id="`${id}-avatar`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="art.orangeTop" />
        <stop offset="1" :stop-color="art.orangeBottom" />
      </linearGradient>
      <clipPath :id="`${id}-avatar-clip`">
        <circle cx="35" cy="46" r="13" />
      </clipPath>
      <filter :id="`${id}-drop`" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.2" :flood-color="art.shadow" flood-opacity="0.16" />
      </filter>
    </defs>
    <path :d="SQUIRCLE_PATH" :fill="`url(#${id}-bg)`" />
    <rect x="14" y="24" width="72" height="54" rx="8" :fill="art.paper" :filter="`url(#${id}-drop)`" />
    <circle cx="35" cy="46" r="13" :fill="`url(#${id}-avatar)`" />
    <g :clip-path="`url(#${id}-avatar-clip)`" :fill="art.paper">
      <circle cx="35" cy="42.5" r="5" />
      <ellipse cx="35" cy="59" rx="10" ry="8" />
    </g>
    <rect x="55" y="38" width="22" height="4.5" rx="2.25" :fill="art.lineMid" />
    <rect x="55" y="47" width="15" height="4.5" rx="2.25" :fill="art.lineLight" />
    <rect x="23" y="66" width="54" height="4" rx="2" :fill="art.lineLight" />
    <path :d="SQUIRCLE_PATH" fill="none" :stroke="art.shadow" stroke-opacity="0.08" stroke-width="0.6" />
  </svg>
</template>
