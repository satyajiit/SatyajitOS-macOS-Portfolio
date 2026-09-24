<script setup lang="ts">
import { computed } from 'vue'

/** Continuous slider (volume, brightness). Native range input underneath. */
const value = defineModel<number>({ default: 50 })
const props = withDefaults(
  defineProps<{
    label: string
    min?: number
    max?: number
    step?: number
    platform?: 'mac' | 'ios'
    disabled?: boolean
  }>(),
  { min: 0, max: 100, step: 1, platform: 'mac', disabled: false },
)
const pct = computed(() => ((value.value - props.min) / (props.max - props.min)) * 100)
</script>

<template>
  <input
    v-model.number="value"
    type="range"
    class="ui-slider"
    :class="`is-${platform}`"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :aria-label="label"
    :style="{ '--pct': `${pct}%` }"
  />
</template>

<style scoped>
.ui-slider {
  --track: 4px;
  --knob: 18px;
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  height: var(--knob);
  background: transparent;
  cursor: default;
}
.is-ios {
  --track: 4px;
  --knob: 27px;
}
.ui-slider::-webkit-slider-runnable-track {
  height: var(--track);
  border-radius: 999px;
  background: linear-gradient(
    to right,
    var(--accent) var(--pct),
    var(--fill) var(--pct)
  );
}
.ui-slider::-moz-range-track {
  height: var(--track);
  border-radius: 999px;
  background: var(--fill);
}
.ui-slider::-moz-range-progress {
  height: var(--track);
  border-radius: 999px;
  background: var(--accent);
}
.ui-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: var(--knob);
  height: var(--knob);
  margin-top: calc((var(--track) - var(--knob)) / 2);
  border-radius: 999px;
  background: var(--knob);
  box-shadow: var(--elev-knob);
  transition: transform var(--dur-micro) var(--ease-out);
}
.ui-slider::-moz-range-thumb {
  width: var(--knob);
  height: var(--knob);
  border: none;
  border-radius: 999px;
  background: var(--knob);
  box-shadow: var(--elev-knob);
}
.ui-slider:hover:not(:disabled)::-webkit-slider-thumb {
  box-shadow: var(--elev-knob-hover);
}
.ui-slider:active:not(:disabled)::-webkit-slider-thumb {
  transform: scale(1.08);
}
.ui-slider:focus-visible {
  outline: none;
}
.ui-slider:focus-visible::-webkit-slider-thumb {
  outline: 3px solid var(--focus-ring);
}
.ui-slider:focus-visible::-moz-range-thumb {
  outline: 3px solid var(--focus-ring);
}
.ui-slider:disabled {
  opacity: 0.45;
}
</style>
