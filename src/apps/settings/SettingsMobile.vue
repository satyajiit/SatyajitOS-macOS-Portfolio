<script setup lang="ts">
import { computed, defineAsyncComponent, provide, ref, type Component } from 'vue'

import { SETTINGS_NAV, type SettingsPageId } from './navigation'
import RootPage from './pages/RootPage.vue'

/**
 * iOS Settings. A tiny navigation stack: pages push in from the right and
 * pop back to the right, with the page underneath shifting slightly, as
 * UINavigationController does.
 */
const pages: Record<SettingsPageId, { title: string; component: Component }> = {
  root: { title: 'Settings', component: RootPage },
  profile: { title: 'Profile', component: defineAsyncComponent(() => import('./pages/ProfilePage.vue')) },
  wifi: { title: 'Wi-Fi', component: defineAsyncComponent(() => import('./pages/WifiPage.vue')) },
  bluetooth: {
    title: 'Bluetooth',
    component: defineAsyncComponent(() => import('./pages/BluetoothPage.vue')),
  },
  notifications: {
    title: 'Notifications',
    component: defineAsyncComponent(() => import('./pages/NotificationsPage.vue')),
  },
  display: {
    title: 'Display & Brightness',
    component: defineAsyncComponent(() => import('./pages/DisplayPage.vue')),
  },
  about: { title: 'About', component: defineAsyncComponent(() => import('./pages/AboutPage.vue')) },
  update: {
    title: 'Software Update',
    component: defineAsyncComponent(() => import('./pages/UpdatePage.vue')),
  },
  install: {
    title: 'Add to Home Screen',
    component: defineAsyncComponent(() => import('./pages/InstallPage.vue')),
  },
  developer: {
    title: 'Developer',
    component: defineAsyncComponent(() => import('./pages/DeveloperPage.vue')),
  },
}

const stack = ref<SettingsPageId[]>(['root'])
const direction = ref<'push' | 'pop'>('push')
const current = computed(() => stack.value[stack.value.length - 1]!)

provide(SETTINGS_NAV, {
  push(page) {
    direction.value = 'push'
    stack.value = [...stack.value, page]
  },
  back() {
    if (stack.value.length < 2) return
    direction.value = 'pop'
    stack.value = stack.value.slice(0, -1)
  },
  backLabel() {
    const below = stack.value[stack.value.length - 2]
    return below ? pages[below].title : undefined
  },
})
</script>

<template>
  <div class="relative h-full overflow-clip bg-ios-grouped">
    <Transition :name="direction">
      <component :is="pages[current].component" :key="current" class="page" />
    </Transition>
  </div>
</template>

<style scoped>
.page {
  position: absolute;
  inset: 0;
}

.push-enter-active,
.push-leave-active,
.pop-enter-active,
.pop-leave-active {
  transition:
    transform var(--dur-long) var(--ease-out),
    opacity var(--dur-long) var(--ease-out);
}

.push-enter-from {
  transform: translateX(100%);
}
.push-leave-to {
  transform: translateX(-30%);
  opacity: 0.6;
}
.pop-enter-from {
  transform: translateX(-30%);
  opacity: 0.6;
}
.pop-leave-to {
  transform: translateX(100%);
}
.push-enter-active,
.pop-leave-active {
  z-index: 1;
  box-shadow: var(--elev-window);
}
</style>
