<script setup lang="ts">
import { computed } from 'vue'

import { glyphs, type GlyphName } from './registry'

/**
 * One inline symbol, sized to the surrounding text (1em) and sitting on its
 * baseline like an SF Symbol. `tinted: false` inherits the text colour.
 */
const props = withDefaults(defineProps<{ name: GlyphName; tinted?: boolean }>(), { tinted: true })
const def = computed(() => glyphs[props.name])
const color = computed(() =>
  props.tinted && def.value.tint ? `var(--sys-${def.value.tint})` : undefined,
)
</script>

<template>
  <component
    :is="def.icon"
    class="glyph"
    :class="{ 'is-filled': def.filled }"
    :style="color ? { color } : undefined"
    aria-hidden="true"
  />
</template>

<style scoped>
.glyph {
  display: inline-block;
  width: 1.05em;
  height: 1.05em;
  vertical-align: -0.16em;
  stroke-width: 2;
  flex: none;
}
.is-filled {
  fill: currentColor;
}
</style>
