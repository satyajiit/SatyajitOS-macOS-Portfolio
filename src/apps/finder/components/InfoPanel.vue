<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import { computed } from 'vue'

import type { TagColor } from '@/content/files'
import { exit, spring } from '@/design/motion'
import { IconText, UiButton } from '@/ui'

import { funStatsOf, insightOf, kindLabel, type Item } from '../fs'

import ItemIcon from './ItemIcon.vue'
import TagDots from './TagDots.vue'

/** Get Info (⌘I): a small inspector window with disclosure sections. */
const props = defineProps<{ item: Item | null; tagColors: TagColor[] }>()
const emit = defineEmits<{ close: []; open: [item: Item]; share: [item: Item] }>()

const stats = computed(() => (props.item ? funStatsOf(props.item) : null))
const where = computed(() => props.item?.path.split('/').slice(0, -1).join('/') || '/')
</script>

<template>
  <Teleport to="body">
    <AnimatePresence>
      <motion.aside
        v-if="item"
        class="info fixed flex flex-col overflow-clip rounded-window bg-window shadow-window"
        role="dialog"
        :aria-label="`${item.name} Info`"
        :initial="{ opacity: 0, scale: 0.96 }"
        :animate="{ opacity: 1, scale: 1 }"
        :exit="{ opacity: 0, scale: 0.96, transition: { duration: exit(0.2) } }"
        :transition="spring.default"
        @keydown.esc="emit('close')"
      >
        <header class="chrome relative flex h-8 shrink-0 items-center border-b border-separator bg-window-toolbar px-3">
          <button type="button" class="close focus-ring" aria-label="Close Info" @click="emit('close')">
            <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.8 3.8l4.4 4.4M8.2 3.8 3.8 8.2" /></svg>
          </button>
          <h2 class="pointer-events-none absolute inset-x-10 truncate text-center text-headline text-label-secondary">
            {{ item.name }} Info
          </h2>
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-4 text-callout">
          <div class="flex items-center gap-3 border-b border-separator py-3">
            <div class="size-12 shrink-0"><ItemIcon :item="item" /></div>
            <div class="min-w-0">
              <p class="break-words text-headline text-label">{{ item.name }}</p>
              <p class="text-label-secondary">{{ item.size ?? '--' }}</p>
              <p class="text-label-secondary">Modified: {{ item.modified ?? 'Some time ago' }}</p>
            </div>
          </div>

          <details open>
            <summary>General:</summary>
            <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              <dt>Kind:</dt>
              <dd>{{ kindLabel(item) }}</dd>
              <dt>Size:</dt>
              <dd>{{ item.size ?? '--' }}</dd>
              <dt>Where:</dt>
              <dd class="break-all">{{ where }}</dd>
              <dt>Modified:</dt>
              <dd>{{ item.modified ?? '--' }}</dd>
              <template v-if="item.description">
                <dt>About:</dt>
                <dd><IconText :text="item.description" /></dd>
              </template>
            </dl>
          </details>

          <details v-if="item.tags?.length || tagColors.length" open>
            <summary>Tags:</summary>
            <div class="flex flex-wrap items-center gap-1.5">
              <TagDots :colors="tagColors" />
              <span v-for="tag in item.tags" :key="tag" class="chip">{{ tag }}</span>
            </div>
          </details>

          <details open>
            <summary>Insider Info:</summary>
            <p class="text-label"><IconText :text="insightOf(item)" /></p>
          </details>

          <details v-if="item.tooltip" open>
            <summary>Comments:</summary>
            <p class="comment"><IconText :text="item.tooltip" /></p>
          </details>

          <details v-if="stats">
            <summary>Fun Stats:</summary>
            <dl class="tabular grid grid-cols-[1fr_auto] gap-y-1">
              <dt>Times opened</dt>
              <dd>{{ stats.timesOpened }}</dd>
              <dt>Procrastination level</dt>
              <dd>{{ stats.procrastination }}/10</dd>
              <dt>Importance</dt>
              <dd>{{ stats.importance }}</dd>
              <dt>Coffee consumed while creating</dt>
              <dd>{{ stats.coffee }} cups</dd>
            </dl>
          </details>

          <div class="mt-4 flex gap-2">
            <UiButton size="small" block @click="emit('open', item)">
              {{ item.kind === 'folder' ? 'Open Folder' : 'Open File' }}
            </UiButton>
            <UiButton size="small" block @click="emit('share', item)">Share Story</UiButton>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  </Teleport>
</template>

<style scoped>
.info {
  top: calc(var(--menubar-height) + 24px);
  right: 24px;
  width: 280px;
  max-height: calc(100dvh - var(--menubar-height) - 140px);
  z-index: calc(var(--z-dock) - 1);
}
.close {
  width: var(--traffic-size);
  height: var(--traffic-size);
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: var(--traffic-close);
  box-shadow: inset 0 0 0 0.5px var(--traffic-close-edge);
}
.close svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: var(--traffic-close-glyph);
  stroke-width: 1.2;
  stroke-linecap: round;
  opacity: 0;
}
.close:hover svg,
.close:focus-visible svg {
  opacity: 1;
}
.close:active {
  filter: brightness(0.82);
}
details {
  padding: 8px 0 4px;
  border-bottom: 0.5px solid var(--separator);
  color: var(--label-secondary);
}
details dd {
  color: var(--label);
}
summary {
  margin-bottom: 6px;
  font-weight: 600;
  color: var(--label);
  cursor: default;
  list-style: none;
}
summary::-webkit-details-marker {
  display: none;
}
summary::before {
  content: '';
  display: inline-block;
  margin-right: 6px;
  border: 4px solid transparent;
  border-left: 5px solid var(--label-secondary);
  border-right: 0;
  transition: transform var(--dur-micro) var(--ease-out);
}
details[open] > summary::before {
  transform: rotate(90deg);
}
summary:focus-visible {
  outline: 3px solid var(--focus-ring);
  border-radius: 4px;
}
.chip {
  padding: 0 6px;
  border-radius: 999px;
  background: var(--fill-secondary);
  color: var(--label);
}
.comment {
  padding: 6px 8px;
  border-radius: var(--radius-control);
  background: var(--text-background);
  box-shadow: var(--elev-control);
  color: var(--label);
}
</style>
