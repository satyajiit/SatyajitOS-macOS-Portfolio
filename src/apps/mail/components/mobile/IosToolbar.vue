<script setup lang="ts">
/**
 * Bottom toolbar. Content scrolls under it, so screens pad their scroll area
 * by the toolbar's height. Sits above the home indicator.
 */
</script>

<template>
  <footer
    class="ios-toolbar material-ios-bar chrome absolute inset-x-0 bottom-0 z-10 flex min-h-[49px] items-center justify-between gap-4 border-t border-ios-separator px-5 pt-2"
  >
    <slot />
  </footer>
</template>

<style scoped>
.ios-toolbar {
  padding-bottom: max(env(safe-area-inset-bottom), var(--ios-home-indicator-height, 20px));
}
.ios-toolbar :deep(button) {
  display: grid;
  place-items: center;
  min-width: 32px;
  min-height: 32px;
  color: var(--accent);
}
.ios-toolbar :deep(button:active) {
  opacity: 0.4;
}
.ios-toolbar :deep(button:disabled) {
  color: var(--ios-label-tertiary);
}
.ios-toolbar :deep(button svg) {
  width: 23px;
  height: 23px;
}
</style>
