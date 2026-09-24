<script setup lang="ts">
/** The macOS/iOS activity indicator: twelve spokes stepping round. */
withDefaults(defineProps<{ size?: number; label?: string }>(), { size: 16, label: 'Loading' })
const spokes = Array.from({ length: 12 }, (_, i) => i)
</script>

<template>
  <span class="inline-grid place-items-center" role="status" :aria-label="label">
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      class="spinner text-label-secondary"
      aria-hidden="true"
    >
      <line
        v-for="i in spokes"
        :key="i"
        x1="12"
        y1="2.5"
        x2="12"
        y2="7"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        :opacity="0.15 + (i / 12) * 0.85"
        :transform="`rotate(${i * 30} 12 12)`"
      />
    </svg>
  </span>
</template>

<style scoped>
.spinner {
  animation: spin 1s steps(12, end) infinite;
}
</style>
