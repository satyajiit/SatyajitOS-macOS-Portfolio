<script setup lang="ts">
/** The round toggle in Control Center modules: accent-filled when on. */
defineProps<{ on: boolean; label: string; disabled?: boolean }>()
defineEmits<{ toggle: [] }>()
</script>

<template>
  <button
    type="button"
    class="cc-circle"
    :aria-pressed="on"
    :aria-label="label"
    :disabled="disabled"
    @click="$emit('toggle')"
  >
    <slot />
  </button>
</template>

<style scoped>
.cc-circle {
  display: grid;
  place-items: center;
  flex: none;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: var(--fill);
  color: var(--label);
  transition:
    background-color var(--dur-micro) var(--ease-out),
    filter var(--dur-micro) var(--ease-out);
}
.cc-circle :deep(svg) {
  width: 15px;
  height: 15px;
}
.cc-circle[aria-pressed='true'] {
  background: var(--accent);
  color: var(--label-on-accent);
}
.cc-circle:hover:not(:disabled) {
  filter: brightness(1.12);
}
.cc-circle:active:not(:disabled) {
  filter: brightness(0.88);
}
.cc-circle:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 1px;
}
.cc-circle:disabled {
  opacity: 0.45;
}
</style>
