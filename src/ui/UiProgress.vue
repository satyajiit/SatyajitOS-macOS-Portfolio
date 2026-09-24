<script setup lang="ts">
/** Linear progress. Omit `value` for the indeterminate (barber-pole-free) sweep. */
withDefaults(defineProps<{ value?: number; label: string; tone?: 'accent' | 'light' }>(), {
  value: undefined,
  tone: 'accent',
})
</script>

<template>
  <div
    class="progress"
    :class="`tone-${tone}`"
    role="progressbar"
    :aria-label="label"
    :aria-valuenow="value === undefined ? undefined : Math.round(value)"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div
      class="fill"
      :class="{ indeterminate: value === undefined }"
      :style="value === undefined ? undefined : { transform: `scaleX(${Math.min(value, 100) / 100})` }"
    />
  </div>
</template>

<style scoped>
.progress {
  position: relative;
  height: 5px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--fill-secondary);
}
.fill {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--accent);
  transform-origin: left center;
  transition: transform var(--dur-short) var(--ease-out);
}
/* Boot-screen style: white bar on a dim track, like the Mac startup bar */
.tone-light {
  background: var(--boot-track);
}
.tone-light .fill {
  background: var(--boot-fill);
}
.indeterminate {
  width: 35%;
  animation: sweep 1.3s var(--ease-in-out) infinite;
}
@keyframes sweep {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(300%);
  }
}
</style>
