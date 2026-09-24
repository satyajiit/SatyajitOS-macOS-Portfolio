<script setup lang="ts">
import { AtSign, BriefcaseBusiness, FolderGit2, Mail, MapPin, MessageCircle } from '@lucide/vue'

import { profile } from '@/content/profile'
import { UiListGroup, UiListRow } from '@/ui'

import SettingsPage from '../SettingsPage.vue'

const open = (url: string) => window.open(url, '_blank', 'noopener')
</script>

<template>
  <SettingsPage title="Profile">
    <header class="flex flex-col items-center px-6 pb-7 pt-2 text-center">
      <img :src="profile.avatar" :alt="profile.name" class="size-24 rounded-full object-cover shadow-icon" />
      <h2 class="mt-3 text-ios-title-1 font-bold text-ios-label">{{ profile.name }}</h2>
      <p class="text-ios-subheadline text-ios-label-secondary">{{ profile.headline }}</p>
      <p class="mt-1 text-ios-footnote text-ios-label-secondary">{{ profile.role }} · {{ profile.company }}</p>
    </header>

    <UiListGroup>
      <UiListRow title="Email" :detail="profile.email" tint="var(--sys-blue)" interactive @select="open(`mailto:${profile.email}`)">
        <template #icon><Mail /></template>
      </UiListRow>
      <UiListRow title="Location" :detail="profile.location" tint="var(--sys-red)">
        <template #icon><MapPin /></template>
      </UiListRow>
      <UiListRow title="Handle" :detail="`@${profile.handle}`" tint="var(--sys-gray)">
        <template #icon><AtSign /></template>
      </UiListRow>
    </UiListGroup>

    <UiListGroup header="Elsewhere">
      <UiListRow title="GitHub" tint="var(--sys-graphite)" chevron @select="open(profile.links.github)">
        <template #icon><FolderGit2 /></template>
      </UiListRow>
      <UiListRow title="LinkedIn" tint="var(--sys-blue)" chevron @select="open(profile.links.linkedin)">
        <template #icon><BriefcaseBusiness /></template>
      </UiListRow>
      <UiListRow title="Twitter" tint="var(--sys-cyan)" chevron @select="open(profile.links.twitter)">
        <template #icon><MessageCircle /></template>
      </UiListRow>
    </UiListGroup>

    <UiListGroup header="Highlights" :footer="profile.tagline">
      <UiListRow v-for="item in profile.highlights" :key="item" :title="item" />
    </UiListGroup>
  </SettingsPage>
</template>
