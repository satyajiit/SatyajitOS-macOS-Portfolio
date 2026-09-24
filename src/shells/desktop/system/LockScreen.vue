<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import { animate } from 'motion-v'
import { computed, onMounted, ref } from 'vue'

import wallpaperDark from '@/assets/wallpapers/horizon-dark.webp'
import wallpaperLight from '@/assets/wallpapers/horizon-light.webp'
import { useClock } from '@/composables/useClock'
import { profile } from '@/content/profile'
import { lock } from '@/content/system'
import { useAppearanceStore } from '@/stores/appearance'
import { useSystemStore } from '@/stores/system'
import UiSpinner from '@/ui/UiSpinner.vue'
import IconText from '@/ui/IconText.vue'

/**
 * The macOS lock screen: blurred desktop, big clock up top, the user and a
 * password field at the bottom. A wrong password shakes the field, the way
 * loginwindow does.
 */
const system = useSystemStore()
const clock = useClock()
const appearance = useAppearanceStore()
// Like loginwindow, the lock screen shows only the blurred wallpaper: no windows, no Dock.
const wallpaper = computed(() => `url(${appearance.isDark ? wallpaperDark : wallpaperLight})`)

const password = ref('')
const error = ref('')
const busy = ref(false)
const field = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const quip = lock.quips[Math.floor(Math.random() * lock.quips.length)]
const attempts = computed(() => system.lockScreenAttempts)

async function submit() {
  if (!password.value || busy.value || system.isCoolingDown) return
  busy.value = true
  const ok = await system.unlockScreen(password.value)
  busy.value = false
  if (ok) return
  error.value = system.isCoolingDown ? lock.tooManyAttempts : lock.wrongPassword
  password.value = ''
  if (field.value && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    animate(field.value, { x: [0, -12, 10, -8, 6, -3, 0] }, { duration: 0.45 })
  }
  input.value?.focus()
}

onMounted(() => input.value?.focus())
</script>

<template>
  <div class="lock fixed inset-0 flex flex-col items-center justify-between py-[8vh] text-white chrome">
    <div class="backdrop" :style="{ backgroundImage: wallpaper }" aria-hidden="true" />
    <div class="flex flex-col items-center">
      <p class="text-title-2 font-semibold opacity-90">{{ clock.longDate.value }}</p>
      <p class="clock tabular text-clock font-display">{{ clock.bigTime.value }}</p>
      <p class="mt-2 text-body opacity-80"><IconText :text="quip" /></p>
    </div>

    <form class="flex flex-col items-center gap-3" @submit.prevent="submit">
      <img :src="profile.avatar" :alt="profile.name" class="size-16 rounded-full object-cover shadow-icon" />
      <p class="text-title-3 font-semibold">{{ profile.name }}</p>

      <div ref="field" class="field" :class="{ 'has-error': error }">
        <input
          ref="input"
          v-model="password"
          type="password"
          class="min-w-0 flex-1 bg-transparent text-body text-white outline-none"
          :placeholder="lock.placeholder"
          :aria-label="lock.placeholder"
          :aria-invalid="!!error || undefined"
          :aria-describedby="error ? 'lock-error' : 'lock-hint'"
          :disabled="system.isCoolingDown"
          autocomplete="current-password"
          @input="error = ''"
        />
        <button
          type="submit"
          class="go"
          aria-label="Unlock"
          :disabled="!password || busy || system.isCoolingDown"
        >
          <UiSpinner v-if="busy" :size="12" label="Unlocking" />
          <ArrowRight v-else aria-hidden="true" />
        </button>
      </div>

      <p v-if="error" id="lock-error" role="alert" class="text-callout font-medium">
        <IconText :text="error" />
        <span v-if="attempts" class="tabular opacity-75">({{ attempts }}/{{ system.maxLockScreenAttempts }})</span>
      </p>
      <p id="lock-hint" class="text-callout opacity-70"><IconText :text="lock.hint" /></p>
    </form>
  </div>
</template>

<style scoped>
.lock {
  z-index: var(--z-system);
  isolation: isolate;
  overflow: clip;
  background: var(--boot-bg);
  text-shadow: var(--elev-text-desktop);
}
.backdrop {
  position: absolute;
  inset: -80px;
  z-index: -1;
  background: center / cover no-repeat;
  filter: blur(var(--blur-xl)) saturate(140%) brightness(0.85);
}
.clock {
  font-size: clamp(64px, 11vw, 112px);
  line-height: 1;
}
.field {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 190px;
  height: 30px;
  padding: 0 4px 0 12px;
  border-radius: 999px;
  background: var(--fill-secondary);
  box-shadow: inset 0 0 0 0.5px var(--edge-light);
  backdrop-filter: blur(var(--blur-md));
}
.field:focus-within {
  outline: 3px solid var(--focus-ring);
}
.field.has-error {
  box-shadow: inset 0 0 0 1px var(--sys-red);
}
.field input::placeholder {
  color: currentColor;
  opacity: 0.6;
}
.go {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: var(--fill);
  color: inherit;
}
.go svg {
  width: 13px;
  height: 13px;
  stroke-width: 2.5;
}
.go:hover:not(:disabled) {
  background: var(--fill-secondary);
}
.go:active:not(:disabled) {
  background: var(--control-pressed);
}
.go:disabled {
  opacity: 0.4;
}
.go:focus-visible {
  outline: 3px solid var(--focus-ring);
}
</style>
