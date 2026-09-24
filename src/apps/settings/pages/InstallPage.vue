<script setup lang="ts">
import { Share, SquarePlus } from '@lucide/vue'
import { ref } from 'vue'

import { settings as copy } from '@/content/mobile'
import { usePlatform } from '@/composables/usePlatform'
import { useAnalytics } from '@/composables/useAnalytics'
import { useMobileStore } from '@/stores/mobile'
import { IosButton, UiListGroup } from '@/ui'

import SettingsPage from '../SettingsPage.vue'

/**
 * Safari has no install API, so iOS gets the share-sheet steps; Chromium gets
 * a real Install button from the captured beforeinstallprompt event.
 */
const store = useMobileStore()
const { isStandalone } = usePlatform()
const { trackPWAInstall } = useAnalytics()
const state = ref<'idle' | 'loading' | 'success' | 'error'>('idle')

async function install() {
  const prompt = store.installPrompt
  if (!prompt) return
  state.value = 'loading'
  await prompt.prompt()
  const { outcome } = await prompt.userChoice
  store.installPrompt = null
  state.value = outcome === 'accepted' ? 'success' : 'idle'
  if (outcome === 'accepted') trackPWAInstall()
}
</script>

<template>
  <SettingsPage title="Add to Home Screen">
    <p class="px-8 pb-6 pt-2 text-center text-ios-subheadline text-ios-label-secondary">
      {{ isStandalone ? copy.addToHomeScreen.installed : copy.addToHomeScreen.intro }}
    </p>

    <UiListGroup v-if="store.installPrompt || state === 'success'">
      <li class="p-4">
        <IosButton :state="state" loading-label="Installing" @click="install">
          {{ state === 'success' ? 'Installed' : copy.addToHomeScreen.installButton }}
        </IosButton>
      </li>
    </UiListGroup>

    <UiListGroup v-if="!isStandalone" header="On iPhone or iPad">
      <li v-for="(step, i) in copy.addToHomeScreen.steps" :key="step" class="step">
        <span class="num tabular">{{ i + 1 }}</span>
        <span class="flex-1 text-ios-body text-ios-label">{{ step }}</span>
        <Share v-if="i === 1" class="size-5 text-accent" aria-hidden="true" />
        <SquarePlus v-if="i === 2" class="size-5 text-ios-label" aria-hidden="true" />
      </li>
    </UiListGroup>
  </SettingsPage>
</template>

<style scoped>
.step {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  padding: 10px 16px;
  border-bottom: 0.5px solid var(--ios-separator);
}
.step:last-child {
  border-bottom: none;
}
.num {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  flex: none;
  border-radius: 999px;
  background: var(--ios-fill-tertiary);
  color: var(--ios-label-secondary);
  font-size: var(--text-ios-footnote);
  font-weight: 600;
}
</style>
