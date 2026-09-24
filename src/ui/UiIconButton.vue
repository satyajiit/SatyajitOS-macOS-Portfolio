<script setup lang="ts">
/**
 * Toolbar item: an icon in a hover capsule. `pressed` is for toggles (sidebar,
 * view modes). `label` is required: it is the accessible name and tooltip.
 */
withDefaults(
  defineProps<{ label: string; pressed?: boolean; disabled?: boolean; size?: 'small' | 'regular' }>(),
  { pressed: undefined, disabled: false, size: 'regular' },
)
</script>

<template>
  <button
    type="button"
    class="icon-button chrome focus-ring"
    :class="`is-${size}`"
    :aria-label="label"
    :title="label"
    :aria-pressed="pressed"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style scoped>
.icon-button {
  display: inline-grid;
  place-items: center;
  border-radius: var(--radius-control);
  color: var(--label-secondary);
  transition: background-color var(--dur-micro) var(--ease-out);
}
.is-regular {
  width: 30px;
  height: 28px;
}
.is-small {
  width: 24px;
  height: 22px;
}
.icon-button :deep(svg) {
  width: 17px;
  height: 17px;
}
.is-small :deep(svg) {
  width: 15px;
  height: 15px;
}
.icon-button:hover:not(:disabled) {
  background: var(--fill-tertiary);
  color: var(--label);
}
.icon-button:active:not(:disabled) {
  background: var(--fill);
}
.icon-button[aria-pressed='true'] {
  background: var(--fill-secondary);
  color: var(--label);
}
.icon-button:disabled {
  color: var(--label-quaternary);
}
</style>
