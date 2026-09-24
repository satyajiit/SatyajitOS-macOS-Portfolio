<script setup lang="ts">
import { Check } from '@lucide/vue'

/**
 * A menu row. Highlights in the accent colour on hover and keyboard focus,
 * shows a checkmark for toggles and right-aligned shortcut glyphs (⌘⇧Q).
 */
withDefaults(
  defineProps<{
    shortcut?: string
    disabled?: boolean
    checked?: boolean
    destructive?: boolean
  }>(),
  { disabled: false, checked: undefined, destructive: false },
)
const emit = defineEmits<{ select: [] }>()
</script>

<template>
  <div
    :role="checked === undefined ? 'menuitem' : 'menuitemcheckbox'"
    class="item"
    :class="{ 'is-destructive': destructive }"
    :tabindex="disabled ? undefined : -1"
    :aria-disabled="disabled || undefined"
    :aria-checked="checked"
    @click="!disabled && emit('select')"
    @keydown.enter.prevent="!disabled && emit('select')"
    @keydown.space.prevent="!disabled && emit('select')"
  >
    <span class="check" aria-hidden="true"><Check v-if="checked" /></span>
    <span class="icon" aria-hidden="true"><slot name="icon" /></span>
    <span class="text truncate"><slot /></span>
    <kbd v-if="shortcut" class="shortcut">{{ shortcut }}</kbd>
  </div>
</template>

<style scoped>
.item {
  display: flex;
  align-items: center;
  height: 22px;
  padding: 0 10px 0 2px;
  border-radius: var(--radius-menu-item);
  font-size: var(--text-body);
  color: var(--label);
  cursor: default;
  outline: none;
}
.check {
  width: 18px;
  display: grid;
  place-items: center;
}
.check svg {
  width: 12px;
  height: 12px;
  stroke-width: 2.5;
}
.icon:empty {
  display: none;
}
.icon {
  display: grid;
  place-items: center;
  width: 16px;
  margin-right: 6px;
}
.icon :deep(svg) {
  width: 14px;
  height: 14px;
}
.text {
  flex: 1;
}
.shortcut {
  margin-left: 24px;
  font-family: var(--font-sans);
  font-size: var(--text-body);
  color: var(--label-tertiary);
  letter-spacing: 0.08em;
}
.is-destructive .text {
  color: var(--sys-red);
}

.item:hover:not([aria-disabled]),
.item:focus-visible {
  background: var(--accent);
  color: var(--label-on-accent);
}
.item:hover:not([aria-disabled]) .shortcut,
.item:focus-visible .shortcut,
.item:hover:not([aria-disabled]) .text,
.item:focus-visible .text {
  color: var(--label-on-accent);
}
.item:active:not([aria-disabled]) {
  background: var(--accent-pressed);
}
.item[aria-disabled] {
  color: var(--label-tertiary);
}
</style>
