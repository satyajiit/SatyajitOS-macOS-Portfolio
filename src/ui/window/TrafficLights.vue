<script setup lang="ts">
import { computed } from 'vue'

import { useWindowContext } from './context'

/**
 * Close / minimise / zoom. Grey when the window is not key; the glyphs only
 * appear while the pointer is over the group, exactly like AppKit.
 */
const ctx = useWindowContext()
const inactive = computed(() => (ctx ? !ctx.isKey.value : false))
</script>

<template>
  <div class="traffic chrome" :class="{ 'is-inactive': inactive }" data-no-drag>
    <button type="button" class="light close" aria-label="Close" @click.stop="ctx?.close()">
      <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.8 3.8l4.4 4.4M8.2 3.8 3.8 8.2" /></svg>
    </button>
    <button type="button" class="light minimize" aria-label="Minimize" @click.stop="ctx?.minimize()">
      <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 6h6" /></svg>
    </button>
    <button
      type="button"
      class="light zoom"
      :aria-label="ctx?.isZoomed.value ? 'Exit zoom' : 'Zoom'"
      @click.stop="ctx?.toggleZoom()"
    >
      <svg viewBox="0 0 12 12" aria-hidden="true" class="filled">
        <path d="M3.4 8.6V4.9l3.7 3.7z" />
        <path d="M8.6 3.4v3.7L4.9 3.4z" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.traffic {
  display: flex;
  gap: var(--traffic-gap);
  align-items: center;
}

.light {
  position: relative;
  width: var(--traffic-size);
  height: var(--traffic-size);
  border-radius: 999px;
  display: grid;
  place-items: center;
  padding: 0;
  cursor: default;
  box-shadow: inset 0 0 0 0.5px var(--edge);
  background: var(--fill-color);
}

/* Enlarged hit target without changing the drawn size */
.light::after {
  content: '';
  position: absolute;
  inset: -4px -3px;
}

.close {
  --fill-color: var(--traffic-close);
  --edge: var(--traffic-close-edge);
  --glyph: var(--traffic-close-glyph);
}
.minimize {
  --fill-color: var(--traffic-minimize);
  --edge: var(--traffic-minimize-edge);
  --glyph: var(--traffic-minimize-glyph);
}
.zoom {
  --fill-color: var(--traffic-zoom);
  --edge: var(--traffic-zoom-edge);
  --glyph: var(--traffic-zoom-glyph);
}

.is-inactive:not(:hover) .light {
  --fill-color: var(--traffic-inactive);
  --edge: var(--traffic-inactive-edge);
}

svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: var(--glyph);
  stroke-width: 1.2;
  stroke-linecap: round;
  opacity: 0;
}
svg.filled {
  fill: var(--glyph);
  stroke: none;
}

.traffic:hover svg,
.light:focus-visible svg {
  opacity: 1;
}

.light:active {
  filter: brightness(0.82);
}

.light:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 1px;
}
</style>
