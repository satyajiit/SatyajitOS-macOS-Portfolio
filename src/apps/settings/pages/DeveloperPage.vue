<script setup lang="ts">
import { Monitor, FolderGit2 } from '@lucide/vue'

import { settings as copy } from '@/content/mobile'
import { usePlatform } from '@/composables/usePlatform'
import { usePWAStore } from '@/stores/pwa'
import { UiListGroup, UiListRow } from '@/ui'

import SettingsPage from '../SettingsPage.vue'

const pwa = usePWAStore()
const { forceShell } = usePlatform()
const buildMode = import.meta.env.MODE
const openSource = () => window.open(copy.sourceUrl, '_blank', 'noopener')
</script>

<template>
  <SettingsPage title="Developer">
    <UiListGroup footer="Swaps this phone for the full macOS desktop. Best on a big screen.">
      <UiListRow title="Switch to Desktop Mode" tint="var(--sys-indigo)" chevron @select="forceShell('desktop')">
        <template #icon><Monitor /></template>
      </UiListRow>
    </UiListGroup>

    <UiListGroup>
      <UiListRow title="View Source on GitHub" tint="var(--sys-graphite)" chevron @select="openSource">
        <template #icon><FolderGit2 /></template>
      </UiListRow>
      <UiListRow title="Offline Support" :detail="pwa.offlineReady ? 'Ready' : 'Not cached yet'" />
      <UiListRow title="Build" :detail="buildMode" />
    </UiListGroup>
  </SettingsPage>
</template>
