<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

/**
 * NSMenu-style panel for menu-bar menus, context menus and pop-up buttons.
 * Arrow keys move between items, Home/End jump, Esc emits `close`.
 * Position it yourself; this only draws the panel and handles keys.
 */
const props = withDefaults(defineProps<{ label: string; autofocus?: boolean }>(), {
  autofocus: false,
})
const emit = defineEmits<{ close: [] }>()
const panel = ref<HTMLElement | null>(null)

function items(): HTMLElement[] {
  return Array.from(
    panel.value?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])') ??
      [],
  )
}

function move(delta: number) {
  const list = items()
  if (!list.length) return
  const i = list.indexOf(document.activeElement as HTMLElement)
  const next = i === -1 ? (delta > 0 ? 0 : list.length - 1) : (i + delta + list.length) % list.length
  list[next]?.focus()
}

onMounted(async () => {
  if (!props.autofocus) return
  await nextTick()
  items()[0]?.focus()
})
</script>

<template>
  <div
    ref="panel"
    role="menu"
    class="menu material-menu chrome"
    :aria-label="label"
    @keydown.down.prevent="move(1)"
    @keydown.up.prevent="move(-1)"
    @keydown.home.prevent="items()[0]?.focus()"
    @keydown.end.prevent="items().at(-1)?.focus()"
    @keydown.esc.prevent="emit('close')"
  >
    <slot />
  </div>
</template>

<style scoped>
.menu {
  min-width: 220px;
  padding: 5px;
  border-radius: var(--radius-menu);
}
</style>
