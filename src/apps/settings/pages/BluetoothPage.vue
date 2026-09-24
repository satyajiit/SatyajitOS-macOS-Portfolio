<script setup lang="ts">
import { Bluetooth } from '@lucide/vue'
import { computed } from 'vue'

import { settings as copy } from '@/content/mobile'
import { useMobileStore } from '@/stores/mobile'
import { UiListGroup, UiListRow, UiSwitch } from '@/ui'

import SettingsPage from '../SettingsPage.vue'

const store = useMobileStore()
const on = computed({
  get: () => store.controls.bluetooth,
  set: (next: boolean) => (store.controls.bluetooth = next),
})
</script>

<template>
  <SettingsPage title="Bluetooth">
    <UiListGroup :footer="on ? `Now discoverable as “${copy.deviceName}”.` : undefined">
      <UiListRow title="Bluetooth" tint="var(--sys-blue)">
        <template #icon><Bluetooth /></template>
        <template #accessory><UiSwitch v-model="on" label="Bluetooth" platform="ios" /></template>
      </UiListRow>
    </UiListGroup>

    <UiListGroup v-if="on" header="My Devices">
      <UiListRow
        v-for="device in store.bluetoothDevices"
        :key="device.name"
        :title="device.name"
        :detail="device.connected ? 'Connected' : 'Not Connected'"
        interactive
        @select="device.connected = !device.connected"
      />
    </UiListGroup>
  </SettingsPage>
</template>
