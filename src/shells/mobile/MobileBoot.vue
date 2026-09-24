<script setup lang="ts">
import { computed } from 'vue'

import { boot } from '@/content/mobile'
import { useMobileStore } from '@/stores/mobile'
import UiProgress from '@/ui/UiProgress.vue'
import IconText from '@/ui/IconText.vue'

/** Black screen, white bolt, thin progress bar: the iPhone start-up, rebranded. */
const store = useMobileStore()
const message = computed(() => {
  const i = Math.min(boot.messages.length - 1, Math.floor((store.bootProgress / 100) * boot.messages.length))
  return boot.messages[i]
})
</script>

<template>
  <div class="boot fixed inset-0 flex flex-col items-center justify-center" role="status" aria-label="Starting up">
    <svg viewBox="0 0 24 24" class="bolt" aria-hidden="true">
      <path
        d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"
        fill="currentColor"
        stroke="currentColor"
        stroke-width="0.6"
        stroke-linejoin="round"
      />
    </svg>
    <div class="absolute inset-x-0 bottom-[22%] flex flex-col items-center gap-3">
      <UiProgress :value="store.bootProgress" label="Starting SatyajitOS" tone="light" class="w-[140px]" />
      <p class="text-ios-caption-1 opacity-50"><IconText :text="message" /></p>
    </div>
  </div>
</template>

<style scoped>
.boot {
  background: var(--boot-bg);
  color: var(--boot-fg);
}

.bolt {
  width: 76px;
  height: 76px;
}
</style>
