<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <section class="mt-3 first:mt-1">
    <h2 v-if="title" class="px-2.5 pb-1 text-subheadline font-semibold text-label-tertiary">
      {{ title }}
    </h2>
    <ul role="list" class="flex flex-col gap-px">
      <slot />
    </ul>
  </section>
</template>
