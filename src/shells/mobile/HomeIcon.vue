<script setup lang="ts">
import { computed, ref } from 'vue'

import type { AppDefinition } from '@/apps/registry'
import { useAppearanceStore } from '@/stores/appearance'
import { useMobileStore } from '@/stores/mobile'
import UiAppIcon from '@/ui/UiAppIcon.vue'

/**
 * A home-screen or dock icon. Tap launches (zooming out of this exact icon),
 * a long press enters jiggle mode. Icons darken while pressed, like SpringBoard.
 */
const props = withDefaults(defineProps<{ app: AppDefinition; size: number; label?: boolean }>(), {
  label: true,
})

const store = useMobileStore()
const appearance = useAppearanceStore()
const art = ref<HTMLElement | null>(null)
const badge = computed(() => props.app.badge?.() ?? 0)
const name = computed(() => props.app.mobile?.label ?? props.app.name)

let pressTimer: ReturnType<typeof setTimeout> | undefined
let longPressed = false

function onDown() {
  longPressed = false
  clearTimeout(pressTimer)
  pressTimer = setTimeout(() => {
    longPressed = true
    store.toggleEditMode()
    navigator.vibrate?.(30)
  }, 500)
}

function cancelPress() {
  clearTimeout(pressTimer)
}

function launch() {
  cancelPress()
  if (longPressed || store.isEditMode) return
  const rect = art.value?.getBoundingClientRect()
  store.openApp(
    props.app.id,
    rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null,
  )
}
</script>

<template>
  <button
    type="button"
    class="home-icon focus-ring"
    :class="{ 'is-jiggling': store.isEditMode }"
    :aria-label="badge ? `${name}, ${badge} new` : name"
    @pointerdown="onDown"
    @pointerup="cancelPress"
    @pointerleave="cancelPress"
    @pointercancel="cancelPress"
    @contextmenu.prevent
    @click="launch"
  >
    <span ref="art" class="art" :data-app-icon="app.id">
      <UiAppIcon :name="app.icon" :size="size" :badge="badge" />
    </span>
    <span
      v-if="label"
      class="label"
      :class="appearance.isDark ? 'text-white text-shadow-desktop' : 'text-ios-label'"
      :style="{ maxWidth: `${size + 18}px` }"
    >
      {{ name }}
    </span>
  </button>
</template>

<style scoped>
.home-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 0;
  border-radius: 16px;
  -webkit-touch-callout: none;
}

.art {
  display: block;
  transition:
    transform var(--dur-micro) var(--ease-out),
    filter var(--dur-micro) var(--ease-out);
}

.home-icon:active .art {
  transform: scale(0.94);
  filter: brightness(0.72);
}

.label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--text-ios-caption-2);
  line-height: var(--text-ios-caption-2--line-height);
  font-weight: 500;
}

.is-jiggling .art {
  animation: jiggle 0.26s var(--ease-in-out) infinite alternate;
}
.is-jiggling:nth-child(even) .art {
  animation-delay: -0.13s;
}

@keyframes jiggle {
  from {
    transform: rotate(-1.6deg);
  }
  to {
    transform: rotate(1.6deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .is-jiggling .art {
    animation: none;
    opacity: 0.85;
  }
}
</style>
