<script setup lang="ts">
import { ref } from 'vue'

import { settings as copy } from '@/content/mobile'
import { site } from '@/content/site'
import { usePWAStore } from '@/stores/pwa'
import { IosButton, UiListGroup } from '@/ui'
import { appIcons } from '@/ui/app-icons'

import SettingsPage from '../SettingsPage.vue'

/**
 * Asks the service worker to look for a new build. If one is waiting, the
 * PWA store flips `updateAvailable` and "Update Now" swaps it in.
 */
const pwa = usePWAStore()
const state = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const Brand = appIcons.brand

async function check() {
  state.value = 'loading'
  const started = Date.now()
  let failed = false
  try {
    const registration = await navigator.serviceWorker?.getRegistration()
    await registration?.update()
  } catch {
    failed = true
  }
  // Long enough to read "Checking…" instead of a flicker.
  await new Promise((resolve) => setTimeout(resolve, Math.max(0, 1200 - (Date.now() - started))))
  state.value = failed ? 'error' : 'success'
}
</script>

<template>
  <SettingsPage title="Software Update">
    <div class="flex flex-col items-center gap-2 px-8 pb-8 pt-6 text-center">
      <component :is="Brand" class="size-16" style="filter: var(--elev-icon-drop)" />
      <h2 class="mt-2 text-ios-title-3 font-semibold text-ios-label">{{ site.osName }} {{ copy.version }}</h2>
      <p class="text-ios-subheadline text-ios-label-secondary" aria-live="polite">
        {{
          state === 'loading'
            ? copy.checking
            : pwa.updateAvailable
              ? copy.updateAvailable
              : state === 'error'
                ? 'Could not check for updates. Are you offline?'
                : copy.upToDate
        }}
      </p>
    </div>

    <UiListGroup>
      <li class="p-4">
        <IosButton v-if="pwa.updateAvailable" @click="pwa.refreshApp()">Update Now</IosButton>
        <IosButton v-else :state="state" loading-label="Checking for updates" @click="check">
          {{ state === 'success' ? 'Up to Date' : state === 'error' ? 'Try Again' : 'Check for Updates' }}
        </IosButton>
      </li>
    </UiListGroup>
  </SettingsPage>
</template>
