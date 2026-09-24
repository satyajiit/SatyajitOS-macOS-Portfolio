<script setup lang="ts">
import { ChevronRight, Smartphone } from '@lucide/vue'
import { computed, ref } from 'vue'

import { finderCopy, sidebar, tags } from '@/content/files'
import { IosNavBar, UiListGroup, UiListRow, UiSearchField } from '@/ui'

import ItemIcon from '../components/ItemIcon.vue'
import StateView from '../components/StateView.vue'
import { searchItems, sortItems, tagLocationId, type Item } from '../fs'
import { sidebarIcon, TAG_TOKENS } from '../locations'

/** Files' Browse tab: locations, favourites, projects and tags, plus disk-wide search. */
const emit = defineEmits<{ push: [id: string]; item: [item: Item] }>()

const query = ref('')
const results = computed(() => (query.value.trim() ? sortItems(searchItems(query.value), 'name', 1) : []))
</script>

<template>
  <div class="h-full overflow-y-auto bg-ios-grouped">
    <IosNavBar title="Browse" large />
    <div class="px-4 pb-4">
      <UiSearchField v-model="query" platform="ios" placeholder="Search" />
    </div>

    <template v-if="query.trim()">
      <StateView v-if="!results.length" state="noResults" platform="ios" :query="query" @clear="query = ''" />
      <UiListGroup v-else :header="`${results.length} results`">
        <UiListRow
          v-for="item in results"
          :key="item.id"
          :title="item.name"
          :subtitle="[item.modified, item.size].filter(Boolean).join(' – ') || item.description"
          interactive
          @select="item.kind === 'folder' ? emit('push', item.id) : emit('item', item)"
        >
          <template #icon><span class="block size-9"><ItemIcon :item="item" /></span></template>
          <template v-if="item.kind === 'folder'" #accessory>
            <ChevronRight class="size-4 shrink-0 text-ios-label-tertiary" style="stroke-width: 2.5" aria-hidden="true" />
          </template>
        </UiListRow>
      </UiListGroup>
    </template>

    <template v-else>
      <UiListGroup header="Locations" :footer="finderCopy.available">
        <UiListRow
          v-for="entry in sidebar.locations"
          :key="entry.id"
          :title="entry.mobileName"
          chevron
          @select="emit('push', entry.id)"
        >
          <template #icon><Smartphone class="text-accent" aria-hidden="true" /></template>
        </UiListRow>
      </UiListGroup>

      <UiListGroup header="Favorites">
        <UiListRow v-for="entry in sidebar.favorites" :key="entry.id" :title="entry.name" chevron @select="emit('push', entry.id)">
          <template #icon><component :is="sidebarIcon(entry.id)" class="text-accent" aria-hidden="true" /></template>
        </UiListRow>
      </UiListGroup>

      <UiListGroup header="Projects">
        <UiListRow v-for="entry in sidebar.projects" :key="entry.id" :title="entry.name" chevron @select="emit('push', entry.id)">
          <template #icon><component :is="sidebarIcon(entry.id)" class="text-accent" aria-hidden="true" /></template>
        </UiListRow>
      </UiListGroup>

      <UiListGroup header="Tags">
        <UiListRow
          v-for="tag in tags"
          :key="tag.color"
          :title="tag.name"
          chevron
          @select="emit('push', tagLocationId(tag.color))"
        >
          <template #icon>
            <span class="block size-3.5 rounded-full" :style="{ background: TAG_TOKENS[tag.color] }" aria-hidden="true" />
          </template>
        </UiListRow>
      </UiListGroup>
    </template>
  </div>
</template>
