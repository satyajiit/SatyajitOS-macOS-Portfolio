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
        <stop offset="0" :stop-color="art.blueTop" />
        <stop offset="1" :stop-color="art.blueBottom" />
      </linearGradient>
      <linearGradient :id="`${id}-paper`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="art.paper" />
        <stop offset="1" :stop-color="art.paperShade" />
      </linearGradient>
      <filter :id="`${id}-drop`" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" :flood-color="art.shadow" flood-opacity="0.2" />
      </filter>
    </defs>
    <path :d="SQUIRCLE_PATH" :fill="`url(#${id}-bg)`" />
    <g :filter="`url(#${id}-drop)`">
      <rect x="19" y="30" width="62" height="42" rx="5" :fill="`url(#${id}-paper)`" />
    </g>
    <path d="M21 71 42 52M79 71 58 52" :stroke="art.lineMid" stroke-width="1.6" stroke-linecap="round" fill="none" />
    <path
      d="M20.5 33 50 55 79.5 33"
      :stroke="art.lineMid"
      stroke-width="2.2"
      stroke-linejoin="round"
      stroke-linecap="round"
      fill="none"
    />
    <path :d="SQUIRCLE_PATH" fill="none" :stroke="art.paper" stroke-opacity="0.3" stroke-width="0.6" />
  </svg>
</template>
