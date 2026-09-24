<script setup lang="ts">
import { Check, TriangleAlert } from '@lucide/vue'

import UiSpinner from '../UiSpinner.vue'

/**
 * The big filled iOS button (50pt, continuous corners) that sits at the
 * bottom of a form. Same async states as UiButton: loading blocks taps,
 * success/error tint the button and swap in a glyph.
 */
withDefaults(
  defineProps<{
    state?: 'idle' | 'loading' | 'success' | 'error'
    disabled?: boolean
    loadingLabel?: string
  }>(),
  { state: 'idle', disabled: false, loadingLabel: 'Working' },
)
</script>

<template>
  <button
    type="button"
    class="action focus-ring chrome"
    :class="`state-${state}`"
    :disabled="disabled || state === 'loading'"
    :aria-busy="state === 'loading' || undefined"
    :data-state="state"
  >
    <UiSpinner v-if="state === 'loading'" :size="18" class="spin" :label="loadingLabel" />
    <Check v-else-if="state === 'success'" class="glyph" aria-hidden="true" />
    <TriangleAlert v-else-if="state === 'error'" class="glyph" aria-hidden="true" />
    <span class="truncate"><slot /></span>
  </button>
</template>

<style scoped>
.action {
  display: flex;
  width: 100%;
  height: 50px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 20px;
  border-radius: 14px;
  background: var(--accent);
  color: var(--label-on-accent);
  font-size: var(--text-ios-headline);
  font-weight: 600;
  letter-spacing: var(--text-ios-headline--letter-spacing);
  transition:
    transform var(--dur-micro) var(--ease-out),
    opacity var(--dur-micro) var(--ease-out),
    background-color var(--dur-short) var(--ease-out);
}
.state-idle:hover:not(:disabled) {
  background: var(--accent-hover);
}
.action:active:not(:disabled) {
  transform: scale(0.98);
  opacity: 0.85;
}
.action:disabled {
  opacity: 0.4;
}
.state-loading:disabled {
  opacity: 0.75;
}
.state-success {
  background: var(--sys-green);
}
.state-error {
  background: var(--sys-red);
}
.spin {
  color: var(--label-on-accent);
}
.spin :deep(svg) {
  color: var(--label-on-accent);
}
.glyph {
  width: 20px;
  height: 20px;
  stroke-width: 2.4;
}
</style>
