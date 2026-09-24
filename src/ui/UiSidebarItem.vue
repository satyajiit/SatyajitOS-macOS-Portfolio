<script setup lang="ts">
/**
 * Source-list row. Selected rows get the translucent selection pill; the icon
 * takes the accent colour, like Finder's sidebar.
 */
withDefaults(defineProps<{ selected?: boolean; count?: number; tint?: string }>(), {
  selected: false,
  count: undefined,
  tint: undefined,
})
defineEmits<{ select: [] }>()
</script>

<template>
  <li>
    <button
      type="button"
      class="row focus-ring"
      :aria-current="selected ? 'page' : undefined"
      @click="$emit('select')"
    >
      <span class="icon" :style="tint ? { color: tint } : undefined" aria-hidden="true">
        <slot name="icon" />
      </span>
      <span class="min-w-0 flex-1 truncate text-left"><slot /></span>
      <span v-if="count" class="tabular text-callout text-label-secondary">{{ count }}</span>
    </button>
  </li>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  height: 28px;
  padding: 0 8px;
  border-radius: var(--radius-control);
  font-size: var(--text-body);
  color: var(--label);
  transition: background-color var(--dur-micro) var(--ease-out);
}
.icon {
  display: grid;
  place-items: center;
  width: 18px;
  color: var(--accent);
}
.icon :deep(svg) {
  width: 16px;
  height: 16px;
}
.row:hover:not([aria-current]) {
  background: var(--fill-quaternary);
}
.row:active {
  background: var(--fill-secondary);
}
.row[aria-current] {
  background: var(--fill);
}
</style>
