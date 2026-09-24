<script setup lang="ts">
import { computed } from 'vue'

import Glyph from './glyphs/Glyph.vue'
import { tokenize } from './glyphs/text'

/** Renders copy with `:glyph:` codes as inline icons. Whitespace and newlines pass through. */
const props = withDefaults(
  defineProps<{ text?: string | number | null; tinted?: boolean }>(),
  { text: '', tinted: true },
)
const tokens = computed(() => tokenize(String(props.text ?? '')))
</script>

<template>
  <template v-for="(token, i) in tokens" :key="i">
    <template v-if="token.type === 'text'">{{ token.value }}</template>
    <Glyph v-else :name="token.name" :tinted="tinted" />
  </template>
</template>
