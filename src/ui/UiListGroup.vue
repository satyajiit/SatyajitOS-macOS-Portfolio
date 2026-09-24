<script setup lang="ts">
/** iOS inset-grouped table section (Settings-style). */
defineProps<{ header?: string; footer?: string }>()
</script>

<template>
  <section class="mx-4 mb-8">
    <h2 v-if="header" class="mb-1.5 px-4 text-ios-footnote text-ios-label-secondary">{{ header }}</h2>
    <ul role="list" class="overflow-clip rounded-ios-group bg-ios-grouped-secondary">
      <slot />
    </ul>
    <p v-if="footer" class="mt-1.5 px-4 text-ios-footnote text-ios-label-secondary">{{ footer }}</p>
  </section>
</template>
