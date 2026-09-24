<script setup lang="ts">
import { Check, Lock, Wifi } from '@lucide/vue'
import { computed } from 'vue'

import { settings as copy } from '@/content/mobile'
import { useMobileStore } from '@/stores/mobile'
import { UiListGroup, UiListRow, UiSwitch } from '@/ui'

import SettingsPage from '../SettingsPage.vue'

const store = useMobileStore()
const wifi = computed({
  get: () => store.controls.wifi,
  set: (on: boolean) => (store.controls.wifi = on),
})
const others = computed(() => copy.networks.filter((n) => n.name !== store.joinedNetwork))
const joined = computed(() => copy.networks.find((n) => n.name === store.joinedNetwork))
</script>

<template>
  <SettingsPage title="Wi-Fi">
    <UiListGroup>
      <UiListRow title="Wi-Fi" tint="var(--sys-blue)">
        <template #icon><Wifi /></template>
        <template #accessory><UiSwitch v-model="wifi" label="Wi-Fi" platform="ios" /></template>
      </UiListRow>
      <UiListRow v-if="wifi && joined" :title="joined.name">
        <template #icon><Check class="text-accent" style="stroke-width: 3" /></template>
        <template #accessory>
          <span class="flex items-center gap-2 text-ios-label">
            <Lock v-if="joined.secure" class="size-4" aria-label="Secured" />
            <Wifi class="size-4" aria-hidden="true" />
          </span>
        </template>
      </UiListRow>
    </UiListGroup>

    <UiListGroup v-if="wifi" header="Networks">
      <UiListRow
        v-for="network in others"
        :key="network.name"
        :title="network.name"
        interactive
        @select="store.joinedNetwork = network.name"
      >
        <template #accessory>
          <span class="flex items-center gap-2 text-ios-label">
            <Lock v-if="network.secure" class="size-4" aria-label="Secured" />
            <Wifi class="size-4" :style="{ opacity: 0.4 + network.bars * 0.2 }" aria-hidden="true" />
          </span>
        </template>
      </UiListRow>
    </UiListGroup>
    <p v-else class="px-8 text-center text-ios-footnote text-ios-label-secondary">
      Wi-Fi is off. {{ store.controls.airplane ? 'Airplane Mode is on, too.' : '' }}
    </p>
  </SettingsPage>
</template>
