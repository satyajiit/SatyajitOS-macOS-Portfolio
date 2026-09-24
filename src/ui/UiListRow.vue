<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'
import { computed } from 'vue'

/**
 * iOS table cell. Pass `tint` to get the Settings-style coloured icon square.
 * Renders as a button when `chevron` or `interactive` is set.
 */
const props = withDefaults(
  defineProps<{
    title: string
    detail?: string
    subtitle?: string
    tint?: string
    chevron?: boolean
    interactive?: boolean
    destructive?: boolean
  }>(),
  { chevron: false, interactive: false, destructive: false },
)
defineEmits<{ select: [] }>()
const tag = computed(() => (props.chevron || props.interactive ? 'button' : 'div'))
</script>

<template>
  <li class="list-row">
    <component
      :is="tag"
      :type="tag === 'button' ? 'button' : undefined"
      class="cell"
      :class="{ 'is-interactive': tag === 'button' }"
      @click="$emit('select')"
    >
      <span v-if="tint || $slots.icon" class="icon" :style="tint ? { background: tint } : undefined">
        <slot name="icon" />
      </span>
      <span class="body">
        <span class="text">
          <span class="title" :class="{ 'is-destructive': destructive }">{{ title }}</span>
          <span v-if="subtitle" class="subtitle">{{ subtitle }}</span>
        </span>
        <span v-if="detail" class="detail">{{ detail }}</span>
        <slot name="accessory" />
        <ChevronRight v-if="chevron" class="chevron" aria-hidden="true" />
      </span>
    </component>
  </li>
</template>

<style scoped>
.cell {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 44px;
  padding-left: 16px;
  text-align: left;
  color: var(--ios-label);
  font-size: var(--text-ios-body);
  line-height: var(--text-ios-body--line-height);
  letter-spacing: var(--text-ios-body--letter-spacing);
}
.is-interactive:active {
  background: var(--ios-fill-tertiary);
}
.is-interactive:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: -3px;
}
.icon {
  display: grid;
  place-items: center;
  width: 29px;
  height: 29px;
  flex: none;
  border-radius: 7px;
  color: var(--label-on-accent);
}
.icon :deep(svg) {
  width: 18px;
  height: 18px;
}
.body {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  min-height: 44px;
  padding: 10px 16px 10px 0;
  border-bottom: 0.5px solid var(--ios-separator);
}
.list-row:last-child .body {
  border-bottom: none;
}
.text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.title.is-destructive {
  color: var(--sys-red);
}
.subtitle {
  font-size: var(--text-ios-footnote);
  line-height: var(--text-ios-footnote--line-height);
  color: var(--ios-label-secondary);
}
.detail {
  color: var(--ios-label-secondary);
  white-space: nowrap;
}
.chevron {
  width: 16px;
  height: 16px;
  flex: none;
  color: var(--ios-label-tertiary);
  stroke-width: 2.5;
}
</style>
