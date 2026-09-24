<script setup lang="ts">
import { useId } from 'vue'

import wallpaper from '@/assets/wallpapers/horizon-dark.webp'
import type { ArtName } from '@/content/files'

import { photoArt as paint } from '../icons/palette'

/**
 * Generated stand-ins for the image and video files on disk, drawn as SVG so
 * nothing is fetched from a placeholder service. `thumbnail` crops to fill.
 */
const props = withDefaults(defineProps<{ art: ArtName; thumbnail?: boolean; label?: string }>(), {
  thumbnail: false,
  label: undefined,
})
const id = useId()
const confetti = Array.from({ length: 36 }, (_, i) => ({
  x: (i * 97) % 400,
  y: (i * 53) % 300,
  r: 2 + (i % 3),
  c: paint.confetti[i % paint.confetti.length],
}))
</script>

<template>
  <svg
    viewBox="0 0 400 300"
    :preserveAspectRatio="thumbnail ? 'xMidYMid slice' : 'xMidYMid meet'"
    role="img"
    :aria-label="label ?? props.art"
    class="image-art"
  >
    <defs>
      <linearGradient :id="`${id}-blue`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="paint.memeBlue" />
        <stop offset="1" :stop-color="paint.memeBlueDeep" />
      </linearGradient>
      <linearGradient :id="`${id}-warm`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="paint.memeWarm" />
        <stop offset="1" :stop-color="paint.memeWarmDeep" />
      </linearGradient>
      <linearGradient :id="`${id}-gray`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="paint.memeGray" />
        <stop offset="1" :stop-color="paint.memeGrayDeep" />
      </linearGradient>
      <linearGradient :id="`${id}-party`" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" :stop-color="paint.partyTop" />
        <stop offset="1" :stop-color="paint.partyBottom" />
      </linearGradient>
    </defs>

    <!-- 3:47 AM screenshot of this very desktop -->
    <g v-if="props.art === 'screenshot'">
      <image :href="wallpaper" x="0" y="0" width="400" height="300" preserveAspectRatio="xMidYMid slice" />
      <rect x="0" y="0" width="400" height="12" :fill="paint.menubar" opacity="0.35" />
      <text x="392" y="9" text-anchor="end" font-size="7" :fill="paint.memeInk" class="sans">Mon 15 Jan 3:47 AM</text>
      <g transform="translate(70 48)">
        <rect width="260" height="170" rx="9" :fill="paint.windowDark" />
        <rect width="260" height="20" rx="9" :fill="paint.windowBar" />
        <rect y="12" width="260" height="8" :fill="paint.windowBar" />
        <circle cx="12" cy="10" r="3.4" :fill="paint.close" />
        <circle cx="23" cy="10" r="3.4" :fill="paint.minimize" />
        <circle cx="34" cy="10" r="3.4" :fill="paint.zoom" />
        <text x="14" y="42" font-size="9" :fill="paint.termGreen" class="mono">satyajit@SatyajitOS ~ %</text>
        <text x="14" y="42" dx="118" font-size="9" :fill="paint.termText" class="mono">git push --force</text>
        <text x="14" y="58" font-size="9" :fill="paint.termText" class="mono">Everything up-to-date. Probably.</text>
        <text x="14" y="74" font-size="9" :fill="paint.termGreen" class="mono">satyajit@SatyajitOS ~ %</text>
        <rect x="132" y="66" width="5" height="10" :fill="paint.termText" />
      </g>
    </g>

    <!-- The napkin that started ZyadaShop -->
    <g v-else-if="props.art === 'napkin'">
      <rect width="400" height="300" :fill="paint.napkinEdge" />
      <rect x="22" y="18" width="356" height="264" rx="6" :fill="paint.napkin" />
      <circle cx="318" cy="230" r="38" fill="none" :stroke="paint.stain" stroke-width="7" opacity="0.18" />
      <circle cx="322" cy="226" r="31" fill="none" :stroke="paint.stain" stroke-width="2" opacity="0.14" />
      <g :fill="paint.ink" class="hand">
        <text x="48" y="64" font-size="22" font-weight="700">REVOLUTIONARY BUSINESS IDEA</text>
        <text x="56" y="112" font-size="20">Step 1: Have idea</text>
        <text x="56" y="152" font-size="20">Step 2: ???</text>
        <text x="56" y="192" font-size="20">Step 3: Profit!</text>
      </g>
      <path d="M48 74c90-6 190-6 300 0" fill="none" :stroke="paint.ink" stroke-width="2" stroke-linecap="round" />
      <path d="M232 188c20-24 44-22 60-44" fill="none" :stroke="paint.ink" stroke-width="2.5" stroke-linecap="round" />
      <path d="m284 138 10 5-3 11" fill="none" :stroke="paint.ink" stroke-width="2.5" stroke-linecap="round" />
    </g>

    <!-- Memes: top/bottom caption over a flat plate with a big reaction -->
    <g v-else-if="props.art === 'meme-first-try' || props.art === 'meme-meeting'">
      <rect width="400" height="300" :fill="props.art === 'meme-first-try' ? `url(#${id}-blue)` : `url(#${id}-gray)`" />
      <text x="200" y="168" text-anchor="middle" font-size="110">{{ props.art === 'meme-first-try' ? '🤨' : '😴' }}</text>
      <g class="meme" text-anchor="middle" :fill="paint.memeInk" :stroke="paint.memeStroke" stroke-width="2.4" paint-order="stroke">
        <text x="200" y="48" font-size="30">{{ props.art === 'meme-first-try' ? 'WHEN THE CODE WORKS' : 'THIS MEETING' }}</text>
        <text x="200" y="276" :font-size="props.art === 'meme-first-try' ? 30 : 22">
          {{ props.art === 'meme-first-try' ? 'ON THE FIRST TRY' : 'COULD HAVE BEEN A SLACK MESSAGE' }}
        </text>
      </g>
    </g>

    <g v-else-if="props.art === 'meme-startup'">
      <rect width="200" height="300" :fill="`url(#${id}-blue)`" />
      <rect x="200" width="200" height="300" :fill="`url(#${id}-warm)`" />
      <text x="100" y="178" text-anchor="middle" font-size="84">🚀</text>
      <text x="300" y="178" text-anchor="middle" font-size="84">🔥</text>
      <g class="meme" text-anchor="middle" :fill="paint.memeInk" :stroke="paint.memeStroke" stroke-width="2.2" paint-order="stroke">
        <text x="100" y="52" font-size="24">EXPECTATIONS</text>
        <text x="300" y="52" font-size="24">REALITY</text>
      </g>
    </g>

    <!-- Exit celebration video poster -->
    <g v-else-if="props.art === 'exit-dance'">
      <rect width="400" height="300" :fill="`url(#${id}-party)`" />
      <circle v-for="(dot, i) in confetti" :key="i" :cx="dot.x" :cy="dot.y" :r="dot.r" :fill="dot.c" opacity="0.8" />
      <text x="200" y="182" text-anchor="middle" font-size="120">🕺</text>
      <circle cx="200" cy="150" r="34" :fill="paint.scrim" opacity="0.45" />
      <path d="M190 132v36l30-18z" :fill="paint.memeInk" />
    </g>
  </svg>
</template>

<style scoped>
.image-art {
  display: block;
  width: 100%;
  height: 100%;
}
.sans {
  font-family: var(--font-sans);
}
.mono {
  font-family: var(--font-mono);
}
.hand {
  font-family: 'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive;
}
.meme {
  font-family: Impact, 'Arial Black', 'Helvetica Neue', sans-serif;
  font-weight: 900;
  letter-spacing: 0.02em;
}
</style>
