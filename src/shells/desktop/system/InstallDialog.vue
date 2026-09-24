<script setup lang="ts">
import { Check } from '@lucide/vue'
import { motion } from 'motion-v'
import { onMounted, ref } from 'vue'

import { pwaCopy } from '@/content/desktop'
import { usePwaInstall } from '@/composables/usePwaInstall'
import { spring } from '@/design/motion'
import { useNotificationsStore } from '@/stores/notifications'
import UiAppIcon from '@/ui/UiAppIcon.vue'
import UiButton from '@/ui/UiButton.vue'
import IconText from '@/ui/IconText.vue'

import { shellUi } from '../shellUi'

/**
 * A macOS alert asking to install the PWA. When the browser has no install
 * prompt to offer, it explains where the install option lives instead.
 */
const pwa = usePwaInstall()
const notifications = useNotificationsStore()
const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)]!
const title = pick(pwaCopy.titles)
const message = pick(pwaCopy.messages)
const state = ref<'idle' | 'loading'>('idle')
const primary = ref<HTMLElement | null>(null)

const close = () => (shellUi.installDialog = false)

async function install() {
  if (!pwa.canPrompt.value) return close()
  state.value = 'loading'
  const result = await pwa.install()
  state.value = 'idle'
  close()
  if (result === 'accepted') notifications.notify({ ...pwaCopy.installed, kind: 'success' })
}

onMounted(() => primary.value?.querySelector('button')?.focus())
</script>

<template>
  <div class="scrim fixed inset-0 grid place-items-center" @click.self="close" @keydown.esc="close">
    <motion.div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="install-title"
      aria-describedby="install-message"
      class="material-popover flex w-[280px] flex-col items-center gap-3 rounded-sheet p-5 text-center"
      :initial="{ opacity: 0, scale: 0.94 }"
      :animate="{ opacity: 1, scale: 1 }"
      :transition="spring.default"
    >
      <UiAppIcon name="brand" :size="64" />
      <h2 id="install-title" class="text-headline text-label"><IconText :text="title" /></h2>
      <p id="install-message" class="text-callout text-label-secondary">
        <IconText :text="pwa.canPrompt.value ? message : pwa.manualInstructions.value" />
      </p>
      <ul v-if="pwa.canPrompt.value" class="flex flex-wrap justify-center gap-x-3 gap-y-1 text-callout text-label-secondary">
        <li v-for="perk in pwaCopy.perks" :key="perk" class="flex items-center gap-1">
          <Check class="size-3 text-green" aria-hidden="true" /><IconText :text="perk" />
        </li>
      </ul>
      <div ref="primary" class="mt-1 flex w-full flex-col gap-2">
        <UiButton variant="primary" size="large" block :state="state" @click="install">
          {{ pwa.canPrompt.value ? 'Install' : 'OK' }}
        </UiButton>
        <UiButton v-if="pwa.canPrompt.value" size="large" block @click="close">Not Now</UiButton>
      </div>
    </motion.div>
  </div>
</template>

<style scoped>
.scrim {
  z-index: var(--z-system);
  background: var(--tint-scrim);
}
</style>
