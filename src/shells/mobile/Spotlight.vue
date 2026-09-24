<script setup lang="ts">
import { motion } from 'motion-v'
import { computed, onMounted, ref } from 'vue'

import { mobileApps } from '@/apps/registry'
import { spring } from '@/design/motion'
import { useMobileStore } from '@/stores/mobile'
import UiAppIcon from '@/ui/UiAppIcon.vue'
import UiSearchField from '@/ui/UiSearchField.vue'

/** Home-screen Search: filter apps by name or description, tap to launch. */
const store = useMobileStore()
const query = ref('')
const field = ref<InstanceType<typeof UiSearchField> | null>(null)

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return mobileApps
  return mobileApps.filter((app) =>
    [app.name, app.mobile?.label ?? '', app.description].some((text) => text.toLowerCase().includes(q)),
  )
})

onMounted(() => field.value?.focus())
</script>

<template>
  <div class="fixed inset-0" role="dialog" aria-modal="true" aria-label="Search">
    <motion.div
      class="backdrop absolute inset-0 bg-ios-bg/55"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0 }"
      :transition="{ duration: 0.2 }"
      @click="store.closePanel()"
    />
    <motion.div
      class="panel relative mx-auto flex w-[min(100%-24px,440px)] flex-col gap-4"
      :initial="{ opacity: 0, y: 24 }"
      :animate="{ opacity: 1, y: 0 }"
      :exit="{ opacity: 0, y: 24 }"
      :transition="spring.default"
    >
      <div class="flex items-center gap-3">
        <UiSearchField ref="field" v-model="query" platform="ios" placeholder="Search" class="flex-1" />
        <button
          type="button"
          class="focus-ring h-11 rounded-lg px-1 text-ios-body text-accent active:opacity-60"
          @click="store.closePanel()"
        >
          Cancel
        </button>
      </div>

      <section class="material-ios-platter rounded-ios-card p-3">
        <h2 class="px-1 pb-2 text-ios-footnote font-semibold text-ios-label-secondary">
          {{ query ? 'Apps' : 'Siri Suggestions' }}
        </h2>
        <ul v-if="results.length" role="list" class="grid grid-cols-4 gap-y-3">
          <li v-for="app in results" :key="app.id">
            <button
              type="button"
              class="result focus-ring flex w-full flex-col items-center gap-1.5 rounded-xl py-1"
              @click="store.openApp(app.id)"
            >
              <UiAppIcon :name="app.icon" :size="54" />
              <span class="max-w-full truncate text-ios-caption-2 font-medium text-ios-label">
                {{ app.mobile?.label ?? app.name }}
              </span>
            </button>
          </li>
        </ul>
        <p v-else class="px-1 py-4 text-ios-subheadline text-ios-label-secondary">No results for “{{ query }}”</p>
      </section>
    </motion.div>
  </div>
</template>

<style scoped>
.backdrop {
  backdrop-filter: blur(var(--blur-xl)) saturate(160%);
}

.panel {
  padding-top: calc(var(--ios-status-height) + 12px);
}

.result:active {
  transform: scale(0.94);
  opacity: 0.8;
}
</style>
