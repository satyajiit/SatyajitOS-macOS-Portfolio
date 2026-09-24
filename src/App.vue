<script setup lang="ts">
import { RouterView } from 'vue-router'

import { useAppearanceStore } from '@/stores/appearance'

// Instantiate early so <html data-appearance/accent> stays in sync from the first frame.
useAppearanceStore()
</script>

<template>
  <RouterView />
</template>
