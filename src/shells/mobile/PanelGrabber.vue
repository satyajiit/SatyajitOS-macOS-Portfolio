<script setup lang="ts">
/**
 * Bottom-edge grabber for the pull-down panels: swipe it up to dismiss
 * (the parent wires the drag), or press Enter/Space on it.
 */
defineProps<{ label: string }>()
const emit = defineEmits<{
  down: [PointerEvent]
  move: [PointerEvent]
  up: [PointerEvent]
  activate: []
}>()

function onUp(event: PointerEvent) {
  emit('up', event)
}
</script>

<template>
  <div
    class="grabber chrome"
    role="button"
    tabindex="0"
    :aria-label="label"
    @pointerdown="emit('down', $event)"
    @pointermove="emit('move', $event)"
    @pointerup="onUp"
    @pointercancel="onUp"
    @keydown.enter.prevent="emit('activate')"
    @keydown.space.prevent="emit('activate')"
  >
    <span class="bar bg-white" />
  </div>
</template>

<style scoped>
.grabber {
  position: absolute;
  left: 50%;
  bottom: 0;
  translate: -50% 0;
  width: min(70%, 260px);
  height: calc(max(env(safe-area-inset-bottom), 8px) + 26px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: max(env(safe-area-inset-bottom), 8px);
  touch-action: none;
}

.bar {
  width: 134px;
  max-width: 100%;
  height: 5px;
  border-radius: 999px;
  opacity: 0.8;
  transition: transform var(--dur-micro) var(--ease-out);
}

.grabber:active .bar {
  transform: scaleX(1.06);
}

.grabber:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: -3px;
  border-radius: 12px;
}
</style>
