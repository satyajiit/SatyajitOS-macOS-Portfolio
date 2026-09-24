<script setup lang="ts">
import { ref } from 'vue'

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
import { profile } from '@/content/profile'
import { useWindowsStore } from '@/stores/windows'
import { BrandIcon, Glyph, IconText, UiButton, UiSegmented } from '@/ui'
import { WindowTitlebar } from '@/ui/window'

import { aboutIcons, tintVar } from './icons'
import { useUptime } from './useUptime'

/**
 * "About This Mac", pointed at a person. Same shape as the Monterey-era
 * window: tabs across the top, portrait on the left, spec sheet on the right,
 * fine print at the bottom.
 */
type Tab = 'overview' | 'achievements' | 'skills' | 'facts'

const tabs: { value: Tab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'achievements', label: 'Achievements' },
  { value: 'skills', label: 'Skills' },
  { value: 'facts', label: 'Fun Facts' },
]
const tab = ref<Tab>('overview')

const { uptime, lastUpdated } = useUptime()
const windows = useWindowsStore()

const specValue = (spec: Spec) =>
  spec.value === 'uptime' ? uptime.value : spec.value === 'location' ? profile.location : spec.value

const openLink = (url: string) => window.open(url, '_blank', 'noopener,noreferrer')
</script>

<template>
  <div class="flex h-full flex-col bg-window">
    <WindowTitlebar transparent />

    <div class="chrome flex shrink-0 justify-center pb-3">
      <!-- Fixed width: segments share it equally, like AppKit's tab-style control -->
      <UiSegmented v-model="tab" :options="tabs" label="About sections" />
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto">
      <Transition name="pane" mode="out-in">
        <!-- Overview: portrait + spec sheet -->
        <section v-if="tab === 'overview'" key="overview" class="px-9 pb-5 pt-3">
          <div class="flex items-center gap-8">
            <img
              :src="profile.avatar"
              :alt="profile.name"
              width="136"
              height="136"
              class="size-[136px] shrink-0 rounded-full object-cover shadow-icon"
            />
            <div class="min-w-0 flex-1">
              <h2 class="text-large-title font-semibold text-label">{{ profile.name }}</h2>
              <p class="text-body text-label-secondary">{{ profile.headline }}</p>
              <p class="mb-3 text-callout text-label-tertiary">{{ taglines.join(' · ') }}</p>

              <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-body">
                <template v-for="spec in systemInfo" :key="spec.label">
                  <dt class="font-semibold text-label">{{ spec.label }}</dt>
                  <dd
                    class="truncate text-label-secondary"
                    :class="{ 'tabular font-mono text-callout': spec.mono }"
                  >
                    {{ specValue(spec) }}
                  </dd>
                </template>
              </dl>

              <div class="mt-4 flex gap-2">
                <UiButton @click="windows.open('email')">Contact…</UiButton>
                <UiButton @click="openLink(profile.links.linkedin)">More Info…</UiButton>
              </div>
            </div>
          </div>

          <div class="mt-5 flex items-center gap-3 rounded-xl bg-fill-quaternary px-4 py-2.5">
            <span class="size-2 shrink-0 rounded-full bg-green" aria-hidden="true" />
            <p class="min-w-0 flex-1 text-callout text-label">
              <span class="font-semibold">{{ status.title }}</span>
              <span class="text-label-secondary"> · {{ status.detail }} · </span>
              <span class="text-label-secondary">
                {{ profile.role }} @ {{ profile.company }}, {{ currentRole.note.toLowerCase() }}
                {{ currentRole.subnote.toLowerCase() }}
              </span>
            </p>
            <span class="shrink-0 text-footnote text-label-tertiary">
              {{ status.updatedLabel }} {{ lastUpdated }}
            </span>
          </div>
        </section>

        <!-- Achievements: metrics, badges, milestones -->
        <section v-else-if="tab === 'achievements'" key="achievements" class="px-6 pb-5 pt-2">
          <dl class="grid grid-cols-4 gap-2 text-center">
            <div
              v-for="metric in metrics"
              :key="metric.label"
              class="flex flex-col-reverse justify-end rounded-xl bg-fill-quaternary px-2 py-3"
            >
              <dt class="mt-0.5 text-footnote text-label-secondary">{{ metric.label }}</dt>
              <dd class="tabular text-title-1 font-semibold text-label"><IconText :text="metric.value" /></dd>
            </div>
          </dl>

          <h3 class="mb-2 mt-5 text-headline text-label">Achievement Unlocked</h3>
          <ul role="list" class="grid grid-cols-3 gap-2">
            <li
              v-for="item in highlights"
              :key="item.title"
              class="flex flex-col gap-1 rounded-xl bg-fill-quaternary p-3"
            >
              <component
                :is="aboutIcons[item.icon]"
                class="mb-0.5 size-5"
                :style="{ color: tintVar(item.tint) }"
                aria-hidden="true"
              />
              <span class="text-headline text-label"><IconText :text="item.title" /></span>
              <span class="text-callout text-label-secondary"><IconText :text="item.detail" /></span>
            </li>
          </ul>

          <h3 class="mb-1 mt-5 text-headline text-label">Milestones</h3>
          <ul role="list">
            <li
              v-for="item in milestones"
              :key="item.title"
              class="flex items-center gap-3 border-b border-separator py-2 last:border-b-0"
            >
              <span
                class="grid size-7 shrink-0 place-items-center rounded-md text-on-accent"
                :style="{ background: tintVar(item.tint) }"
                aria-hidden="true"
              >
                <component :is="aboutIcons[item.icon]" class="size-4" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block text-body font-medium text-label"><IconText :text="item.title" /></span>
                <span class="block text-callout text-label-secondary"><IconText :text="item.detail" /></span>
              </span>
            </li>
          </ul>
        </section>

        <!-- Skills: the tech arsenal -->
        <section v-else-if="tab === 'skills'" key="skills" class="px-8 pb-5 pt-2">
          <div
            v-for="group in [techStack.languages, techStack.tools]"
            :key="group.title"
            class="mb-5"
          >
            <h3 class="mb-2 text-headline text-label">{{ group.title }}</h3>
            <ul role="list" class="flex flex-wrap gap-1.5">
              <li
                v-for="item in group.items"
                :key="item.label"
                class="flex items-center gap-1.5 rounded-full bg-fill-secondary py-0.5 pl-1.5 pr-2.5 text-callout text-label"
              >
                <BrandIcon v-if="item.brand" :name="item.brand" :size="14" decorative />
                <Glyph v-else name="database" :tinted="false" class="text-label-secondary" />
                {{ item.label }}
              </li>
            </ul>
          </div>
        </section>

        <!-- Fun facts -->
        <section v-else key="facts" class="px-8 pb-5 pt-1">
          <ul role="list" class="mb-4 flex flex-col gap-1 text-center">
            <li v-for="motto in mottos" :key="motto" class="text-title-3 text-label">
              “<IconText :text="motto" />”
            </li>
          </ul>
          <ul role="list">
            <li
              v-for="fact in funFacts"
              :key="fact.text"
              class="flex gap-3 border-b border-separator py-2.5 last:border-b-0"
            >
              <span class="w-6 shrink-0 text-center text-title-3" aria-hidden="true">
                <Glyph :name="fact.icon" />
              </span>
              <span class="text-body text-label"><IconText :text="fact.text" /></span>
            </li>
          </ul>
        </section>
      </Transition>
    </div>

    <footer class="shrink-0 px-6 pb-3 pt-1 text-center text-footnote text-label-tertiary">
      “{{ philosophy.quote }}” — {{ philosophy.attribution }} · {{ profile.tagline }}
    </footer>
  </div>
</template>

<style scoped>
.pane-enter-active {
  transition: opacity var(--dur-short) var(--ease-out);
}
.pane-leave-active {
  transition: opacity calc(var(--dur-short) * 0.75) var(--ease-in);
}
.pane-enter-from,
.pane-leave-to {
  opacity: 0;
}
</style>
