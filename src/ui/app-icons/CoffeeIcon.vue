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
        <stop offset="0" :stop-color="art.creamTop" />
        <stop offset="1" :stop-color="art.creamBottom" />
      </linearGradient>
      <linearGradient :id="`${id}-mug`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="art.mugTop" />
        <stop offset="1" :stop-color="art.mugBottom" />
      </linearGradient>
      <filter :id="`${id}-drop`" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" :flood-color="art.shadow" flood-opacity="0.2" />
      </filter>
    </defs>
    <path :d="SQUIRCLE_PATH" :fill="`url(#${id}-bg)`" />
    <g :stroke="art.steam" stroke-width="2.6" stroke-linecap="round" fill="none" opacity="0.85">
      <path d="M38 30c-3-3.5 3-6.5 0-10" />
      <path d="M47 30c-3-3.5 3-6.5 0-10" />
      <path d="M56 30c-3-3.5 3-6.5 0-10" />
    </g>
    <ellipse cx="48" cy="77" rx="31" ry="5.5" :fill="art.saucer" />
    <g :filter="`url(#${id}-drop)`">
      <path
        d="M66 45h4.5a9 9 0 0 1 0 18H66"
        :stroke="art.mugBottom"
        stroke-width="5"
        fill="none"
        stroke-linecap="round"
      />
      <path d="M25 38h44v22a14 14 0 0 1-14 14H39a14 14 0 0 1-14-14z" :fill="`url(#${id}-mug)`" />
    </g>
    <ellipse cx="47" cy="38.5" rx="22" ry="5" :fill="art.crema" />
    <path
      d="M47 42c-2.2-1.6-5-2.8-5-4.8 0-1.3 1-2.2 2.3-2.2 1.2 0 2.1.7 2.7 1.6.6-.9 1.5-1.6 2.7-1.6 1.3 0 2.3.9 2.3 2.2 0 2-2.8 3.2-5 4.8z"
      :fill="art.latte"
    />
    <path :d="SQUIRCLE_PATH" fill="none" :stroke="art.shadow" stroke-opacity="0.08" stroke-width="0.6" />
  </svg>
</template>
