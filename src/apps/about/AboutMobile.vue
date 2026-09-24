<script setup lang="ts">
import { ExternalLink, Mail } from '@lucide/vue'
import { useRouter } from 'vue-router'

import {
  currentRole,
  funFacts,
  highlights,
  metrics,
  milestones,
  mottos,
  philosophy,
  status,
  systemInfo,
  taglines,
  techStack,
  type Spec,
} from '@/content/about'
import { profile, socials } from '@/content/profile'
import { BrandIcon, Glyph, IconText, IosNavBar, UiListGroup, UiListRow } from '@/ui'

import { aboutIcons, tintVar } from './icons'
import { useUptime } from './useUptime'

/** The same person as the Mac app, laid out as an iOS profile page. */
const router = useRouter()
const { uptime, lastUpdated } = useUptime()

const specValue = (spec: Spec) =>
  spec.value === 'uptime' ? uptime.value : spec.value === 'location' ? profile.location : spec.value

const openLink = (url: string) => window.open(url, '_blank', 'noopener,noreferrer')
const contact = () => router.push({ name: 'app', params: { appId: 'email' } })
</script>

<template>
  <div class="h-full overflow-y-auto overscroll-contain bg-ios-grouped">
    <IosNavBar title="About Me" large />

    <header class="flex flex-col items-center px-6 pb-7 pt-2 text-center">
      <img
        :src="profile.avatar"
        :alt="profile.name"
        width="96"
        height="96"
        class="size-24 rounded-full object-cover shadow-icon"
      />
      <h2 class="mt-3 text-ios-title-2 font-bold text-ios-label">{{ profile.name }}</h2>
      <p class="text-ios-subheadline text-ios-label-secondary">{{ profile.headline }}</p>
      <ul role="list" class="mt-3 flex flex-wrap justify-center gap-1.5">
        <li
          v-for="tag in taglines"
          :key="tag"
          class="rounded-full bg-ios-fill-tertiary px-2.5 py-1 text-ios-caption-1 font-medium text-ios-label"
        >
          {{ tag }}
        </li>
      </ul>
      <p class="mt-3 text-ios-footnote text-ios-label-secondary">“<IconText :text="mottos[0]" />”</p>
    </header>

    <UiListGroup header="System Information">
      <UiListRow
        v-for="spec in systemInfo"
        :key="spec.label"
        :title="spec.label"
        :detail="specValue(spec)"
      />
    </UiListGroup>

    <UiListGroup header="Status" :footer="`${status.updatedLabel} ${lastUpdated}`">
      <UiListRow :title="status.title" :subtitle="status.detail">
        <template #accessory>
          <span class="size-2.5 rounded-full bg-green" aria-hidden="true" />
        </template>
      </UiListRow>
      <UiListRow
        :title="profile.role"
        :subtitle="`@ ${profile.company} · ${currentRole.note}, ${currentRole.subnote.toLowerCase()}`"
        tint="var(--brand)"
      >
        <template #icon><Briefcase aria-hidden="true" /></template>
      </UiListRow>
    </UiListGroup>

    <section class="mx-4 mb-8" aria-labelledby="metrics-title">
      <h2 id="metrics-title" class="mb-1.5 px-4 text-ios-footnote text-ios-label-secondary">
        Performance Metrics
      </h2>
      <dl class="grid grid-cols-2 gap-2">
        <div
          v-for="metric in metrics"
          :key="metric.label"
          class="flex flex-col-reverse rounded-ios-group bg-ios-grouped-secondary px-4 py-3"
        >
          <dt class="text-ios-footnote text-ios-label-secondary">{{ metric.label }}</dt>
          <dd class="tabular text-ios-title-2 font-bold text-ios-label"><IconText :text="metric.value" /></dd>
        </div>
      </dl>
    </section>

    <UiListGroup header="Achievement Unlocked">
      <UiListRow
        v-for="item in highlights"
        :key="item.title"
        :title="item.title"
        :subtitle="item.detail"
        :tint="tintVar(item.tint)"
      >
        <template #icon><component :is="aboutIcons[item.icon]" aria-hidden="true" /></template>
      </UiListRow>
    </UiListGroup>

    <UiListGroup header="Milestones">
      <UiListRow
        v-for="item in milestones"
        :key="item.title"
        :title="item.title"
        :subtitle="item.detail"
        :tint="tintVar(item.tint)"
      >
        <template #icon><component :is="aboutIcons[item.icon]" aria-hidden="true" /></template>
      </UiListRow>
    </UiListGroup>

    <UiListGroup
      v-for="group in [techStack.languages, techStack.tools]"
      :key="group.title"
      :header="group.title"
    >
      <li class="flex flex-wrap gap-1.5 p-4">
        <span
          v-for="item in group.items"
          :key="item.label"
          class="flex items-center gap-1.5 rounded-full bg-ios-fill-tertiary py-1 pl-2 pr-2.5 text-ios-footnote text-ios-label"
        >
          <BrandIcon v-if="item.brand" :name="item.brand" :size="15" decorative />
          <Glyph v-else name="database" :tinted="false" class="text-ios-label-secondary" />
          {{ item.label }}
        </span>
      </li>
    </UiListGroup>

    <UiListGroup header="Fun Facts">
      <li
        v-for="fact in funFacts"
        :key="fact.text"
        class="flex gap-3 border-b-[0.5px] border-ios-separator py-3 pl-4 pr-4 last:border-b-0"
      >
        <span class="w-6 shrink-0 text-center text-ios-body" aria-hidden="true">
          <Glyph :name="fact.icon" />
        </span>
        <span class="text-ios-subheadline text-ios-label"><IconText :text="fact.text" /></span>
      </li>
    </UiListGroup>

    <UiListGroup header="Say Hello">
      <UiListRow
        title="Send an Email"
        :subtitle="profile.email"
        tint="var(--sys-blue)"
        chevron
        @select="contact"
      >
        <template #icon><Mail aria-hidden="true" /></template>
      </UiListRow>
      <UiListRow
        v-for="link in socials"
        :key="link.label"
        :title="link.label"
        interactive
        @select="openLink(link.url)"
      >
        <template #icon><BrandIcon :name="link.brand" :size="24" decorative class="text-ios-label" /></template>
        <template #accessory>
          <ExternalLink class="size-4 text-ios-label-tertiary" aria-hidden="true" />
        </template>
      </UiListRow>
    </UiListGroup>

    <p class="px-8 pb-10 text-center text-ios-footnote text-ios-label-secondary">
      “{{ philosophy.quote }}”<br />— {{ philosophy.attribution }}
    </p>
  </div>
</template>

