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
        <stop offset="0" :stop-color="art.graphiteTop" />
        <stop offset="1" :stop-color="art.graphiteBottom" />
      </linearGradient>
    </defs>
    <path :d="SQUIRCLE_PATH" :fill="`url(#${id}-bg)`" />
    <rect x="13" y="15" width="74" height="70" rx="8" :fill="art.screen" />
    <rect x="13.5" y="15.5" width="73" height="69" rx="7.5" fill="none" :stroke="art.paper" stroke-opacity="0.08" />
    <path
      d="M25 38l11 8.5L25 55"
      :stroke="art.prompt"
      stroke-width="4.2"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />
    <path d="M42 57h15" :stroke="art.prompt" stroke-width="4.2" stroke-linecap="round" />
    <path :d="SQUIRCLE_PATH" fill="none" :stroke="art.paper" stroke-opacity="0.18" stroke-width="0.6" />
  </svg>
</template>
