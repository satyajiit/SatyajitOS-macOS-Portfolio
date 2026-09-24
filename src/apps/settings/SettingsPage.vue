<script setup lang="ts">
import { IosNavBar } from '@/ui'

import { useSettingsNav } from './navigation'

/** One screen in the Settings stack: scroll view + navigation bar. */
defineProps<{ title: string; large?: boolean }>()
const nav = useSettingsNav()
</script>

<template>
  <div class="h-full overflow-y-auto overscroll-contain bg-ios-grouped pb-12">
    <IosNavBar :title="title" :large="large" :back="nav.backLabel()" @back="nav.back()" />
    <div class="pt-3">
      <slot />
    </div>
  </div>
</template>
