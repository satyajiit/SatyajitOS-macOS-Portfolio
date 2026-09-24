<script setup lang="ts">
import { computed } from 'vue'

/**
 * A circular Control Centre toggle (iOS 18+ shape). Off: frosted module with
 * a label-coloured glyph. On: radios fill with their system colour; every
 * other module lights up white with a dark (or tinted) glyph.
 */
const props = withDefaults(
  defineProps<{
    label: string
    on?: boolean
    /** Fill colour when on (connectivity radios). */
    fill?: string
    /** Glyph colour when on over the lit material. */
    glyph?: string
    size?: 'module' | 'inner'
    /** A one-shot action rather than a toggle (no aria-pressed). */
    action?: boolean
  }>(),
  { on: false, fill: undefined, glyph: undefined, size: 'module', action: false },
)
defineEmits<{ toggle: [] }>()

const tone = computed(() => {
  if (!props.on) return 'text-ios-label'
  return props.fill ? 'text-white' : 'text-black'
})
const style = computed(() => {
  if (!props.on) return undefined
  if (props.fill) return { background: props.fill }
  return props.glyph ? { color: props.glyph } : undefined
})
</script>

<template>
  <button
    type="button"
    class="cc-button focus-ring"
    :class="[size === 'module' ? 'is-module' : 'is-inner', tone, { 'material-ios-module': size === 'module' && !on, 'is-lit': on && !fill }]"
    :aria-label="label"
    :aria-pressed="action ? undefined : on"
    :style="style"
    @click="$emit('toggle')"
  >
    <slot />
  </button>
</template>

<style scoped>
.cc-button {
  display: grid;
  place-items: center;
  border-radius: 999px;
  transition:
    transform var(--dur-micro) var(--ease-out),
    background-color var(--dur-short) var(--ease-out);
}

.is-module {
  width: var(--u);
  height: var(--u);
}

.is-inner {
  width: calc(var(--u) * 0.8);
  height: calc(var(--u) * 0.8);
  background: var(--ios-fill-tertiary);
}

.cc-button :deep(svg) {
  width: 24px;
  height: 24px;
}

.is-lit {
  background: var(--ios-tint-module-on);
}

.cc-button:active {
  transform: scale(0.92);
}
</style>
