<script setup lang="ts">
import { computed } from 'vue'

import type { Item } from '../fs'
import FileIcon from '../icons/FileIcon.vue'
import { folderEmblem } from '../locations'

import ImageArt from './ImageArt.vue'

/** Thumbnail for pictures and movies that have artwork, the file icon for everything else. */
const props = defineProps<{ item: Pick<Item, 'id' | 'kind' | 'ext' | 'preview' | 'name'> }>()

const art = computed(() => {
  if (props.item.kind !== 'image' && props.item.kind !== 'video') return null
  const block = props.item.preview?.find((b) => b.type === 'art')
  return block?.type === 'art' ? block.art : null
})
</script>

<template>
  <div class="grid h-full w-full place-items-center">
    <div v-if="art" class="thumb" :class="{ 'is-video': item.kind === 'video' }">
      <ImageArt :art="art" thumbnail :label="item.name" />
    </div>
    <FileIcon v-else :kind="item.kind" :ext="item.ext" :emblem="folderEmblem(item.id)" />
  </div>
</template>

<style scoped>
.thumb {
  width: 90%;
  aspect-ratio: 4 / 3;
  overflow: clip;
  border-radius: 3px;
  box-shadow: var(--elev-control);
  border: 1.5px solid var(--knob);
}
.is-video {
  border-color: var(--term-bg);
  border-width: 2px 0;
}
</style>
