<script setup lang="ts">
import { computed } from 'vue'

/** Red count badge for Dock / home-screen icons and sidebar rows. */
const props = withDefaults(defineProps<{ count: number; size?: 'small' | 'large'; max?: number }>(), {
  size: 'small',
  max: 99,
})
const text = computed(() => (props.count > props.max ? `${props.max}+` : String(props.count)))
</script>

<template>
  <span
    v-if="count > 0"
    class="badge tabular"
    :class="`is-${size}`"
    :aria-label="`${count} unread`"
  >
    {{ text }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-grid;
  place-items: center;
  border-radius: 999px;
  background: var(--sys-red);
  color: var(--label-on-accent);
  font-weight: 600;
  line-height: 1;
}
.is-small {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 11px;
}
.is-large {
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  font-size: 14px;
}
</style>
