<script setup lang="ts" generic="T extends string">
import Glyph from './glyphs/Glyph.vue'
import type { GlyphName } from './glyphs/registry'

/** Segmented control (view switchers, filters). Arrow keys move the selection. */
const selected = defineModel<T>({ required: true })
const props = withDefaults(
  defineProps<{
    options: { value: T; label: string; icon?: GlyphName }[]
    label: string
    platform?: 'mac' | 'ios'
    disabled?: boolean
  }>(),
  { platform: 'mac', disabled: false },
)

function step(dir: 1 | -1) {
  const i = props.options.findIndex((o) => o.value === selected.value)
  const next = props.options[(i + dir + props.options.length) % props.options.length]
  if (next) selected.value = next.value
}
</script>

<template>
  <div
    role="radiogroup"
    class="segmented chrome"
    :class="[`is-${platform}`, { 'is-disabled': disabled }]"
    :aria-label="label"
    @keydown.right.prevent="step(1)"
    @keydown.left.prevent="step(-1)"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      class="segment focus-ring"
      :aria-checked="option.value === selected"
      :tabindex="option.value === selected ? 0 : -1"
      :disabled="disabled"
      @click="selected = option.value"
    >
      <Glyph v-if="option.icon" :name="option.icon" :tinted="false" class="mr-1" />{{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.segmented {
  /* Equal columns sized to the widest label, like NSSegmentedControl. A column
     never shrinks below its own label, so a tight container can't squash one. */
  display: inline-grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(max-content, 1fr);
  padding: 2px;
  gap: 2px;
  border-radius: 7px;
  background: var(--fill-secondary);
}
.is-ios {
  border-radius: 9px;
  background: var(--ios-fill-tertiary);
}
.segment {
  height: 20px;
  padding: 0 10px;
  border-radius: 5px;
  font-size: var(--text-body);
  font-weight: 500;
  color: var(--label);
  white-space: nowrap;
  transition: background-color var(--dur-micro) var(--ease-out);
}
.is-ios .segment {
  height: 28px;
  border-radius: 7px;
  font-size: var(--text-ios-footnote);
  font-weight: 600;
}
.segment:hover:not([aria-checked='true']):not(:disabled) {
  background: var(--fill-tertiary);
}
.segment:active:not(:disabled) {
  background: var(--fill);
}
.segment[aria-checked='true'] {
  background: var(--control);
  box-shadow: var(--elev-control);
}
.is-ios .segment[aria-checked='true'] {
  background: var(--ios-bg-tertiary);
}
.is-disabled {
  opacity: 0.45;
}
</style>
