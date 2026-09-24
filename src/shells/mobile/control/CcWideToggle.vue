<script setup lang="ts">
import IconText from '@/ui/IconText.vue'
/** A full-width on/off module with a status word and a one-line quip below. */
defineProps<{ label: string; emoji: string; on: boolean; onText: string; offText: string; hint: string }>()
defineEmits<{ toggle: [] }>()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <button
      type="button"
      class="w-toggle focus-ring"
      :class="on ? 'is-lit text-black' : 'material-ios-module text-ios-label'"
      :aria-pressed="on"
      @click="$emit('toggle')"
    >
      <span class="text-ios-title-3" aria-hidden="true"><IconText :text="emoji" /></span>
      <span class="min-w-0 flex-1 truncate text-left text-ios-subheadline font-semibold"><IconText :text="label" /></span>
      <span class="text-ios-footnote font-semibold opacity-70"><IconText :text="on ? onText : offText" /></span>
    </button>
    <p class="px-3 text-ios-caption-1 text-white/70"><IconText :text="hint" /></p>
  </div>
</template>

<style scoped>
.w-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  height: var(--u);
  padding: 0 20px;
  border-radius: calc(var(--u) / 2);
  transition:
    transform var(--dur-micro) var(--ease-out),
    background-color var(--dur-short) var(--ease-out);
}
.is-lit {
  background: var(--ios-tint-module-on);
}
.w-toggle:active {
  transform: scale(0.97);
}
</style>
