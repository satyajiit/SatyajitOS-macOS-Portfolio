<script setup lang="ts">
import { Check, TriangleAlert } from '@lucide/vue'

import UiSpinner from './UiSpinner.vue'

/**
 * macOS push button.
 * - default: the grey bezel button
 * - primary: the accent-filled default button (the one Return triggers)
 * - destructive: default bezel with red text, for "Delete"-type actions
 * - plain: borderless, accent text (inline actions, links that act)
 *
 * `state` covers async work: loading shows the spinner and blocks clicks;
 * success/error swap in a glyph so the result is visible without a toast.
 */
withDefaults(
  defineProps<{
    variant?: 'default' | 'primary' | 'destructive' | 'plain'
    size?: 'small' | 'regular' | 'large'
    state?: 'idle' | 'loading' | 'success' | 'error'
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    block?: boolean
  }>(),
  { variant: 'default', size: 'regular', state: 'idle', disabled: false, type: 'button', block: false },
)
</script>

<template>
  <button
    :type="type"
    class="ui-button chrome focus-ring"
    :class="[`is-${variant}`, `is-${size}`, `state-${state}`, { 'w-full': block }]"
    :disabled="disabled || state === 'loading'"
    :aria-busy="state === 'loading' || undefined"
    :data-state="state"
  >
    <UiSpinner v-if="state === 'loading'" :size="size === 'large' ? 14 : 12" class="spin" />
    <Check v-else-if="state === 'success'" class="glyph" aria-hidden="true" />
    <TriangleAlert v-else-if="state === 'error'" class="glyph" aria-hidden="true" />
    <slot name="icon" />
    <span class="truncate"><slot /></span>
  </button>
</template>

<style scoped>
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: var(--radius-control);
  font-family: var(--font-sans);
  font-weight: 500;
  white-space: nowrap;
  color: var(--label);
  background: var(--control);
  box-shadow: var(--elev-control);
  transition:
    filter var(--dur-micro) var(--ease-out),
    background-color var(--dur-micro) var(--ease-out);
}

.is-small {
  height: 20px;
  padding: 0 8px;
  font-size: var(--text-callout);
}
.is-regular {
  height: 24px;
  padding: 0 12px;
  font-size: var(--text-body);
}
.is-large {
  height: 30px;
  padding: 0 16px;
  font-size: var(--text-body);
  border-radius: 8px;
}

.is-primary {
  color: var(--label-on-accent);
  background: linear-gradient(to bottom, var(--accent-hover), var(--accent));
  box-shadow:
    0 0 0 0.5px var(--accent-pressed),
    inset 0 0.5px 0 var(--edge-light);
}
.is-destructive {
  color: var(--sys-red);
}
.is-plain {
  background: transparent;
  box-shadow: none;
  color: var(--accent);
  padding-inline: 4px;
}

.ui-button:hover:not(:disabled) {
  filter: brightness(1.06);
}
.ui-button:active:not(:disabled) {
  filter: brightness(0.9);
}
.is-default:active:not(:disabled),
.is-destructive:active:not(:disabled) {
  background: var(--control-pressed);
  filter: none;
}
.is-primary:active:not(:disabled) {
  background: var(--accent-pressed);
  filter: none;
}
.is-plain:active:not(:disabled) {
  filter: none;
  opacity: 0.7;
}

.ui-button:disabled {
  color: var(--label-tertiary);
  cursor: default;
}
.is-primary:disabled {
  color: var(--label-on-accent);
  opacity: 0.5;
}
.state-loading:disabled {
  color: var(--label-secondary);
}
.is-primary.state-loading {
  opacity: 0.8;
}
.is-primary .spin {
  color: var(--label-on-accent);
}

.state-error:not(.is-primary) {
  color: var(--sys-red);
}
.state-error.is-primary {
  background: var(--sys-red);
  box-shadow: 0 0 0 0.5px var(--sys-red);
}
.state-success:not(.is-primary) .glyph {
  color: var(--sys-green);
}
.state-success.is-primary {
  background: var(--sys-green);
  box-shadow: 0 0 0 0.5px var(--sys-green);
}

.glyph {
  width: 13px;
  height: 13px;
  flex: none;
}
</style>
