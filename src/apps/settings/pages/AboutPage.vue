<script setup lang="ts">
import { settings as copy } from '@/content/mobile'
import { profile } from '@/content/profile'
import { site } from '@/content/site'
import { UiListGroup, UiListRow } from '@/ui'

import SettingsPage from '../SettingsPage.vue'
</script>

<template>
  <SettingsPage title="About">
    <UiListGroup>
      <UiListRow title="Name" :detail="copy.deviceName" />
      <UiListRow title="Software Version" :detail="`${site.osName} ${copy.version}`" />
      <UiListRow title="Owner" :detail="profile.name" />
      <UiListRow title="Location" :detail="profile.location" />
    </UiListGroup>

    <UiListGroup header="Built With" :footer="profile.tagline">
      <UiListRow v-for="tool in copy.builtWith" :key="tool" :title="tool" />
    </UiListGroup>
  </SettingsPage>
</template>
