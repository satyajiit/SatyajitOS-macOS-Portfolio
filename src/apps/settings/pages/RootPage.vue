<script setup lang="ts">
import {
  Bell,
  Bluetooth,
  ChevronRight,
  Code,
  Info,
  Moon,
  Plane,
  RefreshCw,
  SquarePlus,
  Sun,
  Wifi,
} from '@lucide/vue'
import { computed } from 'vue'

import { profile } from '@/content/profile'
import { settings as copy } from '@/content/mobile'
import { useAppearanceStore } from '@/stores/appearance'
import { useMobileStore } from '@/stores/mobile'
import { useNotificationsStore } from '@/stores/notifications'
import { usePWAStore } from '@/stores/pwa'
import { UiBadge, UiListGroup, UiListRow, UiSwitch } from '@/ui'

import SettingsPage from '../SettingsPage.vue'
import { useSettingsNav } from '../navigation'

const nav = useSettingsNav()
const store = useMobileStore()
const appearance = useAppearanceStore()
const notifications = useNotificationsStore()
const pwa = usePWAStore()

const airplane = computed({
  get: () => store.controls.airplane,
  set: (on: boolean) => store.setAirplane(on),
})
const dark = computed({
  get: () => appearance.isDark,
  set: (on: boolean) => appearance.setMode(on ? 'dark' : 'light'),
})
</script>

<template>
  <SettingsPage title="Settings" large>
    <UiListGroup>
      <li>
        <button type="button" class="profile focus-ring" @click="nav.push('profile')">
          <img :src="profile.avatar" alt="" class="size-[60px] shrink-0 rounded-full object-cover" />
          <span class="flex min-w-0 flex-1 flex-col text-left">
            <span class="truncate text-ios-title-3 text-ios-label">{{ profile.name }}</span>
            <span class="truncate text-ios-footnote text-ios-label-secondary">{{ copy.profileSubtitle }}</span>
          </span>
          <ChevronRight class="size-4 shrink-0 text-ios-label-tertiary" style="stroke-width: 2.5" aria-hidden="true" />
        </button>
      </li>
    </UiListGroup>

    <UiListGroup>
      <UiListRow title="Airplane Mode" tint="var(--sys-orange)">
        <template #icon><Plane /></template>
        <template #accessory><UiSwitch v-model="airplane" label="Airplane Mode" platform="ios" /></template>
      </UiListRow>
      <UiListRow
        title="Wi-Fi"
        tint="var(--sys-blue)"
        :detail="store.wifiNetwork ?? 'Off'"
        chevron
        @select="nav.push('wifi')"
      >
        <template #icon><Wifi /></template>
      </UiListRow>
      <UiListRow
        title="Bluetooth"
        tint="var(--sys-blue)"
        :detail="store.controls.bluetooth ? 'On' : 'Off'"
        chevron
        @select="nav.push('bluetooth')"
      >
        <template #icon><Bluetooth /></template>
      </UiListRow>
    </UiListGroup>

    <UiListGroup>
      <UiListRow
        title="Notifications"
        tint="var(--sys-red)"
        :detail="notifications.doNotDisturb ? 'Do Not Disturb' : undefined"
        chevron
        @select="nav.push('notifications')"
      >
        <template #icon><Bell /></template>
      </UiListRow>
      <UiListRow title="Display & Brightness" tint="var(--sys-blue)" chevron @select="nav.push('display')">
        <template #icon><Sun /></template>
      </UiListRow>
      <UiListRow title="Dark Mode" tint="var(--sys-indigo)">
        <template #icon><Moon /></template>
        <template #accessory><UiSwitch v-model="dark" label="Dark Mode" platform="ios" /></template>
      </UiListRow>
    </UiListGroup>

    <UiListGroup>
      <UiListRow title="About" tint="var(--sys-gray)" chevron @select="nav.push('about')">
        <template #icon><Info /></template>
      </UiListRow>
      <UiListRow
        title="Software Update"
        tint="var(--sys-gray)"
        :subtitle="pwa.updateAvailable ? copy.updateAvailable : copy.upToDate"
        chevron
        @select="nav.push('update')"
      >
        <template #icon><RefreshCw /></template>
        <template #accessory><UiBadge :count="pwa.updateAvailable ? 1 : 0" size="large" /></template>
      </UiListRow>
      <UiListRow title="Add to Home Screen" tint="var(--sys-green)" chevron @select="nav.push('install')">
        <template #icon><SquarePlus /></template>
      </UiListRow>
    </UiListGroup>

    <UiListGroup>
      <UiListRow
        title="Developer"
        :subtitle="copy.developerSubtitle"
        tint="var(--sys-gray)"
        chevron
        @select="nav.push('developer')"
      >
        <template #icon><Code /></template>
      </UiListRow>
    </UiListGroup>
  </SettingsPage>
</template>

<style scoped>
.profile {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 10px 16px;
}
.profile:active {
  background: var(--ios-fill-tertiary);
}
.profile:focus-visible {
  outline-offset: -3px;
}
</style>
