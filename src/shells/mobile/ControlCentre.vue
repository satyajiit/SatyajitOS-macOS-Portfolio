<script setup lang="ts">
import {
  Bluetooth,
  Cast,
  FastForward,
  Flashlight,
  Lock,
  Moon,
  Music2,
  Play,
  Pause,
  Plane,
  Rewind,
  SignalHigh,
  Sun,
  SunMoon,
  Timer,
  Volume1,
  Volume2,
  VolumeX,
  Wifi,
} from '@lucide/vue'
import { useIntervalFn } from '@vueuse/core'
import { motion } from 'motion-v'
import { computed, ref } from 'vue'

import { controlCentre as copy, pickBelow, pickRandom } from '@/content/mobile'
import { spring } from '@/design/motion'
import { useAppearanceStore } from '@/stores/appearance'
import { useMobileStore } from '@/stores/mobile'
import { useNotificationsStore } from '@/stores/notifications'
import IconText from '@/ui/IconText.vue'

import CcButton from './control/CcButton.vue'
import CcVerticalSlider from './control/CcVerticalSlider.vue'
import CcWideSlider from './control/CcWideSlider.vue'
import CcWideToggle from './control/CcWideToggle.vue'
import PanelGrabber from './PanelGrabber.vue'
import { usePanelDrag } from './usePanelDrag'

/**
 * Control Centre, iOS 18+ layout: radios, Now Playing, the round toggles and
 * the two tall sliders, then a second page of Satyajit's own controls.
 */
const store = useMobileStore()
const appearance = useAppearanceStore()
const notifications = useNotificationsStore()
const c = store.controls
const x = copy.extras

const subtitle = pickRandom(copy.subtitles)
const adjusting = ref<'brightness' | 'volume' | null>(null)
const caption = computed(() => {
  if (adjusting.value === 'brightness') {
    const b = c.brightness
    return `Brightness (${pickBelow(copy.brightness.label, b)}) · ${copy.brightness.reading(b)} — ${pickBelow(copy.brightness.hint, b)}`
  }
  if (adjusting.value === 'volume') {
    const v = c.volume
    return `Volume (${pickBelow(copy.volume.label, v)}) · ${copy.volume.reading(v)} — ${pickBelow(copy.volume.hint, v)}`
  }
  return subtitle
})

const volumeIcon = computed(() => (c.volume === 0 ? VolumeX : c.volume <= 50 ? Volume1 : Volume2))

/* A real one-minute timer, because a Timer button that does nothing is sad. */
const timerLeft = ref(0)
const { pause: stopTimer, resume: runTimer } = useIntervalFn(
  () => {
    timerLeft.value -= 1
    if (timerLeft.value <= 0) {
      stopTimer()
      notifications.notify({ title: 'Timer', body: 'Your one-minute timer is done. :alarm:' })
    }
  },
  1000,
  { immediate: false },
)
function toggleTimer() {
  if (timerLeft.value > 0) {
    stopTimer()
    timerLeft.value = 0
  } else {
    timerLeft.value = 60
    runTimer()
  }
}
const timerText = computed(() => `0:${String(timerLeft.value).padStart(2, '0')}`)

const playing = ref(false)

const { y, onDown, onMove, onUp } = usePanelDrag(() => store.closePanel())
</script>

<template>
  <div class="cc fixed inset-0" role="dialog" aria-modal="true" aria-label="Control Centre">
    <motion.div
      class="backdrop absolute inset-0 bg-black/40"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0 }"
      :transition="{ duration: 0.25 }"
    />
    <motion.div
      class="sheet absolute inset-0 overflow-y-auto overscroll-contain"
      :style="{ y }"
      :initial="{ opacity: 0, scale: 0.94 }"
      :animate="{ opacity: 1, scale: 1 }"
      :exit="{ opacity: 0, scale: 0.94 }"
      :transition="spring.default"
      @click.self="store.closePanel()"
    >
      <div class="content mx-auto" @click.self="store.closePanel()">
        <p class="caption mb-4 min-h-8 px-1 text-ios-footnote text-white/75" aria-live="polite">
          <IconText :text="caption" />
        </p>

        <div class="grid-cc">
          <!-- Connectivity -->
          <section class="module-2x2 material-ios-module" aria-label="Connectivity">
            <CcButton
              size="inner"
              label="Airplane Mode"
              :on="c.airplane"
              fill="var(--sys-orange)"
              @toggle="store.setAirplane(!c.airplane)"
            >
              <Plane />
            </CcButton>
            <CcButton
              size="inner"
              label="Cellular Data"
              :on="c.cellular"
              fill="var(--sys-green)"
              @toggle="c.cellular = !c.cellular"
            >
              <SignalHigh />
            </CcButton>
            <CcButton size="inner" label="Wi-Fi" :on="c.wifi" fill="var(--sys-blue)" @toggle="c.wifi = !c.wifi">
              <Wifi />
            </CcButton>
            <CcButton
              size="inner"
              label="Bluetooth"
              :on="c.bluetooth"
              fill="var(--sys-blue)"
              @toggle="c.bluetooth = !c.bluetooth"
            >
              <Bluetooth />
            </CcButton>
          </section>

          <!-- Now Playing -->
          <section class="module-2x2 now-playing material-ios-module" aria-label="Now Playing">
            <div class="flex items-center gap-2.5">
              <span class="grid size-11 place-items-center rounded-lg bg-ios-fill-tertiary text-ios-label-secondary">
                <Music2 class="size-5" aria-hidden="true" />
              </span>
              <span class="min-w-0 text-ios-subheadline font-semibold text-ios-label">
                {{ playing ? 'Lo-fi Beats to Code To' : 'Not Playing' }}
              </span>
            </div>
            <div class="flex items-center justify-around text-ios-label">
              <button type="button" class="transport focus-ring" aria-label="Previous track">
                <Rewind />
              </button>
              <button
                type="button"
                class="transport focus-ring"
                :aria-label="playing ? 'Pause' : 'Play'"
                @click="playing = !playing"
              >
                <Pause v-if="playing" />
                <Play v-else />
              </button>
              <button type="button" class="transport focus-ring" aria-label="Next track">
                <FastForward />
              </button>
            </div>
          </section>

          <CcButton
            label="Orientation Lock"
            :on="c.orientationLock"
            glyph="var(--sys-red)"
            @toggle="c.orientationLock = !c.orientationLock"
          >
            <Lock />
          </CcButton>
          <CcButton label="Screen Mirroring" :on="c.mirroring" @toggle="c.mirroring = !c.mirroring">
            <Cast />
          </CcButton>

          <div class="tall">
            <CcVerticalSlider
              v-model="c.brightness"
              label="Brightness"
              @active="adjusting = $event ? 'brightness' : null"
            >
              <Sun />
            </CcVerticalSlider>
          </div>
          <div class="tall">
            <CcVerticalSlider v-model="c.volume" label="Volume" @active="adjusting = $event ? 'volume' : null">
              <component :is="volumeIcon" />
            </CcVerticalSlider>
          </div>

          <button
            type="button"
            class="focus-module focus-ring"
            :class="notifications.doNotDisturb ? 'is-lit text-black' : 'material-ios-module text-ios-label'"
            :aria-pressed="notifications.doNotDisturb"
            @click="notifications.setDoNotDisturb(!notifications.doNotDisturb)"
          >
            <span
              class="grid size-9 place-items-center rounded-full"
              :class="notifications.doNotDisturb ? 'bg-indigo text-white' : 'bg-ios-fill-tertiary'"
            >
              <Moon class="size-5" aria-hidden="true" />
            </span>
            <span class="flex min-w-0 flex-col text-left">
              <span class="truncate text-ios-subheadline font-semibold">
                {{ notifications.doNotDisturb ? 'Do Not Disturb' : 'Focus' }}
              </span>
              <span v-if="notifications.doNotDisturb" class="text-ios-caption-2 opacity-70">On</span>
            </span>
          </button>

          <CcButton
            label="Flashlight"
            :on="c.flashlight"
            glyph="var(--sys-blue)"
            @toggle="c.flashlight = !c.flashlight"
          >
            <Flashlight />
          </CcButton>
          <CcButton
            :label="timerLeft ? `Timer, ${timerText} left` : 'Start a one-minute timer'"
            :on="timerLeft > 0"
            glyph="var(--sys-orange)"
            @toggle="toggleTimer"
          >
            <span v-if="timerLeft" class="tabular text-ios-headline">{{ timerText }}</span>
            <Timer v-else />
          </CcButton>
          <CcButton label="Dark Mode" :on="appearance.isDark" @toggle="appearance.toggleDark()">
            <SunMoon />
          </CcButton>
        </div>

        <h2 class="mb-3 mt-8 px-1 text-ios-headline text-white"><IconText :text="x.title" /></h2>
        <div class="flex flex-col gap-4 pb-20">
          <CcWideSlider
            v-model="c.productivity"
            :label="x.productivity.label"
            emoji=":zap:"
            :status="pickBelow(x.productivity.emoji, c.productivity)"
            :hint="pickBelow(x.productivity.hint, c.productivity)"
          />
          <CcWideSlider
            v-model="c.caffeine"
            :label="x.caffeine.label"
            emoji=":coffee:"
            :status="pickBelow(x.caffeine.emoji, c.caffeine)"
            :hint="pickBelow(x.caffeine.hint, c.caffeine)"
          />
          <CcWideToggle
            :label="x.procrastination.label"
            emoji=":no:"
            :on="c.procrastinationBlocker"
            on-text="Enabled"
            off-text="Disabled"
            :hint="c.procrastinationBlocker ? x.procrastination.on : x.procrastination.off"
            @toggle="c.procrastinationBlocker = !c.procrastinationBlocker"
          />
          <CcWideSlider
            v-model="c.codeQuality"
            :label="x.codeQuality.label"
            emoji=":target:"
            :status="pickBelow(x.codeQuality.emoji, c.codeQuality)"
            :hint="pickBelow(x.codeQuality.hint, c.codeQuality)"
          />
          <CcWideToggle
            :label="x.innovation.label"
            emoji=":idea:"
            :on="c.innovationMode"
            :on-text="x.innovation.onState"
            :off-text="x.innovation.offState"
            :hint="c.innovationMode ? x.innovation.on : x.innovation.off"
            @toggle="c.innovationMode = !c.innovationMode"
          />
        </div>
      </div>
    </motion.div>

    <PanelGrabber label="Close Control Centre" @down="onDown" @move="onMove" @up="onUp" @activate="store.closePanel()" />
  </div>
</template>

<style scoped>
.backdrop {
  backdrop-filter: blur(var(--blur-xl)) saturate(160%);
}

@media (prefers-reduced-transparency: reduce) {
  .backdrop {
    backdrop-filter: none;
    background: var(--ios-bg-secondary);
  }
}

.sheet {
  --g: 14px;
  --u: min(76px, calc((min(100vw, 440px) - 40px - 3 * var(--g)) / 4));
  transform-origin: 85% 0;
  touch-action: pan-y;
}

.content {
  width: calc(4 * var(--u) + 3 * var(--g));
  padding-top: calc(var(--ios-status-height) + 18px);
}

.grid-cc {
  display: grid;
  grid-template-columns: repeat(4, var(--u));
  grid-auto-rows: var(--u);
  gap: var(--g);
}

.module-2x2 {
  grid-column: span 2;
  grid-row: span 2;
  border-radius: calc(var(--u) * 0.46);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  place-items: center;
  padding: 8px;
}

.now-playing {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  padding: 16px;
}

.transport {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
}
.transport :deep(svg) {
  width: 22px;
  height: 22px;
  fill: currentColor;
}
.transport:active {
  transform: scale(0.88);
  opacity: 0.7;
}

.tall {
  grid-row: span 2;
}

.focus-module {
  grid-column: span 2;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border-radius: calc(var(--u) / 2);
  transition:
    transform var(--dur-micro) var(--ease-out),
    background-color var(--dur-short) var(--ease-out);
}
.focus-module:active {
  transform: scale(0.96);
}
.is-lit {
  background: var(--ios-tint-module-on);
}
</style>
