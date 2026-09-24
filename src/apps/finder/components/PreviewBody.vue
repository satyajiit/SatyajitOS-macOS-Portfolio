<script setup lang="ts">
import { motion } from 'motion-v'
import { computed } from 'vue'

import { spring } from '@/design/motion'

import { lineCount, previewOf, resolveLocation, type Item } from '../fs'

import ImageArt from './ImageArt.vue'
import ItemIcon from './ItemIcon.vue'

/**
 * Renders a file's preview blocks (stats, bar chart, comparison, sections,
 * text or code, artwork). Shared by Quick Look, Gallery view and the phone.
 */
const props = withDefaults(defineProps<{ item: Item; platform?: 'mac' | 'ios' }>(), { platform: 'mac' })

const blocks = computed(() => (props.item.kind === 'folder' ? [] : previewOf(props.item)))
const folderCount = computed(() =>
  props.item.kind === 'folder' ? (resolveLocation(props.item.id)?.items.length ?? 0) : 0,
)
const ios = computed(() => props.platform === 'ios')
</script>

<template>
  <div class="preview flex flex-col gap-5" :class="ios ? 'is-ios' : 'is-mac'">
    <!-- Folders preview as themselves -->
    <div v-if="item.kind === 'folder'" class="flex flex-col items-center gap-3 py-6 text-center">
      <div class="size-32"><ItemIcon :item="item" /></div>
      <h2 class="t-title">{{ item.name }}</h2>
      <p class="t-secondary">{{ folderCount }} {{ folderCount === 1 ? 'item' : 'items' }}</p>
      <p v-if="item.description" class="t-body max-w-md">{{ item.description }}</p>
    </div>

    <template v-for="(block, i) in blocks" :key="i">
      <header v-if="block.type === 'heading'" class="text-center">
        <h2 class="t-title">{{ block.title }}</h2>
        <p v-if="block.subtitle" class="t-secondary mt-1">{{ block.subtitle }}</p>
      </header>

      <div v-else-if="block.type === 'stats'" class="stats grid gap-2">
        <div v-for="stat in block.items" :key="stat.label" class="tile">
          <div class="t-stat tabular">{{ stat.value }}</div>
          <div class="t-caption">{{ stat.label }}</div>
        </div>
      </div>

      <section v-else-if="block.type === 'bars'" class="card">
        <h3 class="t-headline mb-3">{{ block.title }}</h3>
        <ul class="flex flex-col gap-2">
          <li v-for="(row, r) in block.rows" :key="row.label" class="flex items-center gap-3">
            <span class="t-caption w-9 shrink-0">{{ row.label }}</span>
            <div class="track relative h-5 flex-1 overflow-clip rounded-full">
              <motion.div
                class="fill absolute inset-y-0 left-0 w-full origin-left rounded-full"
                :initial="{ scaleX: 0 }"
                :animate="{ scaleX: row.value / block.max }"
                :transition="{ ...spring.gentle, delay: r * 0.04 }"
              />
              <span class="t-caption absolute inset-0 grid place-items-center font-medium">
                {{ row.value }} {{ block.unit }}
              </span>
            </div>
            <span v-if="row.note" class="w-6 shrink-0 text-center" aria-hidden="true">{{ row.note }}</span>
          </li>
        </ul>
      </section>

      <div v-else-if="block.type === 'compare'" class="grid gap-3" :class="ios ? 'grid-cols-1' : 'grid-cols-2'">
        <section v-for="(col, c) in block.columns" :key="col.title" class="card">
          <h3 class="t-headline mb-2">{{ col.title }}</h3>
          <dl class="flex flex-col gap-1.5">
            <div v-for="row in col.rows" :key="row.label" class="flex justify-between gap-3">
              <dt class="t-secondary">{{ row.label }}</dt>
              <dd class="t-body font-medium" :class="{ 'text-green': c === block.columns.length - 1 }">
                {{ row.value }}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section v-else-if="block.type === 'section'" class="card">
        <h3 class="t-headline mb-1.5">{{ block.title }}</h3>
        <p class="t-body whitespace-pre-line">{{ block.body }}</p>
      </section>

      <figure v-else-if="block.type === 'text' && block.mono" class="code overflow-clip">
        <figcaption class="code-head flex items-center justify-between">
          <span>{{ block.language ?? 'Text' }}</span>
          <span class="tabular">{{ lineCount(block.body) }} lines · {{ item.size ?? 'Unknown size' }}</span>
        </figcaption>
        <pre class="code-body overflow-x-auto"><code>{{ block.body }}</code></pre>
      </figure>

      <div v-else-if="block.type === 'text'" class="page">
        <p class="t-body whitespace-pre-line">{{ block.body }}</p>
      </div>

      <figure v-else-if="block.type === 'art'" class="flex flex-col items-center gap-2">
        <div class="art w-full overflow-clip">
          <ImageArt :art="block.art" :label="item.name" />
        </div>
        <figcaption v-if="block.caption" class="t-secondary text-center">{{ block.caption }}</figcaption>
      </figure>
    </template>
  </div>
</template>

<style scoped>
.is-mac {
  --t-title: var(--text-title-2);
  --t-title-lh: var(--text-title-2--line-height);
  --t-body: var(--text-body);
  --t-body-lh: 18px;
  --t-caption: var(--text-callout);
  --t-stat: var(--text-title-1);
  --ink: var(--label);
  --ink-2: var(--label-secondary);
  --surface: var(--fill-quaternary);
  --edge: var(--separator);
}
.is-ios {
  --t-title: var(--text-ios-title-3);
  --t-title-lh: var(--text-ios-title-3--line-height);
  --t-body: var(--text-ios-body);
  --t-body-lh: var(--text-ios-body--line-height);
  --t-caption: var(--text-ios-footnote);
  --t-stat: var(--text-ios-title-2);
  --ink: var(--ios-label);
  --ink-2: var(--ios-label-secondary);
  --surface: var(--ios-bg-grouped-secondary);
  --edge: var(--ios-separator);
}

.t-title {
  font-size: var(--t-title);
  line-height: var(--t-title-lh);
  font-weight: 700;
  color: var(--ink);
}
.t-headline {
  font-size: var(--t-body);
  font-weight: 600;
  color: var(--ink);
}
.t-body {
  font-size: var(--t-body);
  line-height: var(--t-body-lh);
  color: var(--ink);
}
.t-secondary {
  font-size: var(--t-caption);
  color: var(--ink-2);
}
.t-caption {
  font-size: var(--t-caption);
  color: var(--ink-2);
}
.t-stat {
  font-size: var(--t-stat);
  line-height: 1.15;
  font-weight: 600;
  color: var(--ink);
}

.stats {
  grid-template-columns: repeat(auto-fit, minmax(min(120px, 100%), 1fr));
}
.tile,
.card {
  padding: 12px 14px;
  border-radius: var(--radius-xl);
  background: var(--surface);
  box-shadow: inset 0 0 0 0.5px var(--edge);
}
.track {
  background: var(--fill-secondary);
}
.fill {
  background: var(--sys-orange);
  opacity: 0.85;
}

.page {
  padding: 18px 20px;
  border-radius: var(--radius-lg);
  background: var(--text-background);
  box-shadow: inset 0 0 0 0.5px var(--edge);
}
.is-ios .page {
  background: var(--surface);
}

.code {
  border-radius: var(--radius-lg);
  background: var(--term-bg);
  box-shadow: inset 0 0 0 0.5px var(--edge);
}
.code-head {
  padding: 6px 12px;
  font-size: var(--text-callout);
  color: var(--term-dim);
  border-bottom: 0.5px solid var(--separator);
}
.code-body {
  margin: 0;
  padding: 12px 14px;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 18px;
  color: var(--term-fg);
  white-space: pre;
}
.is-ios .code-body {
  white-space: pre-wrap;
  font-size: 13px;
}

.art {
  border-radius: var(--radius-lg);
  box-shadow: var(--elev-control);
}
</style>
