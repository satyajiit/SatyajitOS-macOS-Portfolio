<script setup lang="ts">
import { useTitle } from '@vueuse/core'
import { computed, defineAsyncComponent } from 'vue'

import { getApp } from '@/apps/registry'
import { usePlatform } from '@/composables/usePlatform'
import { site } from '@/content/site'
import { useMobileStore } from '@/stores/mobile'
import { useWindowsStore } from '@/stores/windows'

/** Boots the Mac on desktops and the iPhone on phones. See usePlatform for the rules. */
const DesktopShell = defineAsyncComponent(() => import('./desktop/DesktopShell.vue'))
const MobileShell = defineAsyncComponent(() => import('./mobile/MobileShell.vue'))

const { shell } = usePlatform()
const windows = useWindowsStore()
const mobile = useMobileStore()

// The tab title follows the frontmost app, the way a Mac's menu bar does.
const activeId = computed(() => (shell.value === 'desktop' ? windows.focusedId : mobile.activeApp))
useTitle(
  computed(() => {
    const app = activeId.value ? getApp(activeId.value) : undefined
    return app ? `${app.name} — ${site.osName}` : site.title
  }),
)
</script>

<template>
  <DesktopShell v-if="shell === 'desktop'" />
  <MobileShell v-else />
</template>
