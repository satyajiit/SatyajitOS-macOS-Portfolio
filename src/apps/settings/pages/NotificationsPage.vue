<script setup lang="ts">
import { Moon } from '@lucide/vue'
import { computed } from 'vue'

import { useNotificationsStore } from '@/stores/notifications'
import { UiListGroup, UiListRow, UiSwitch } from '@/ui'

import SettingsPage from '../SettingsPage.vue'

const notifications = useNotificationsStore()
const dnd = computed({
  get: () => notifications.doNotDisturb,
  set: (on: boolean) => notifications.setDoNotDisturb(on),
})
const count = computed(() => notifications.history.length)
</script>

<template>
  <SettingsPage title="Notifications">
    <UiListGroup footer="Banners stay quiet while Do Not Disturb is on. Everything still lands in Notification Centre.">
      <UiListRow title="Do Not Disturb" tint="var(--sys-indigo)">
        <template #icon><Moon /></template>
        <template #accessory><UiSwitch v-model="dnd" label="Do Not Disturb" platform="ios" /></template>
      </UiListRow>
    </UiListGroup>

    <UiListGroup :header="`Notification Centre · ${count}`">
      <UiListRow
        title="Clear Notification Centre"
        destructive
        :interactive="count > 0"
        @select="count && notifications.clearAll()"
      />
    </UiListGroup>
  </SettingsPage>
</template>
