<script setup lang="ts">
/**
 * On/off switch. `platform="ios"` draws the 51×31 UIKit switch (green when
 * on); the default is the smaller macOS switch in the accent colour.
 */
const on = defineModel<boolean>({ default: false })
withDefaults(defineProps<{ label: string; platform?: 'mac' | 'ios'; disabled?: boolean }>(), {
  platform: 'mac',
  disabled: false,
})
</script>

<template>
  <button
    type="button"
    role="switch"
    class="ui-switch focus-ring"
    :class="`is-${platform}`"
    :aria-checked="on"
    :aria-label="label"
    :disabled="disabled"
    @click="on = !on"
  >
    <span class="knob" aria-hidden="true" />
  </button>
</template>

<style scoped>
.ui-switch {
  --w: 36px;
  --h: 20px;
  --pad: 1.5px;
  --on: var(--accent);
  --off: var(--fill);
  position: relative;
  flex: none;
  width: var(--w);
  height: var(--h);
  border-radius: 999px;
  background: var(--off);
  box-shadow: inset 0 0 0 0.5px var(--separator);
  transition: background-color var(--dur-short) var(--ease-out);
}
.is-ios {
  --w: 51px;
  --h: 31px;
  --pad: 2px;
  --on: var(--sys-green);
  --off: var(--ios-fill);
  box-shadow: none;
}
.ui-switch[aria-checked='true'] {
  background: var(--on);
}
.knob {
  position: absolute;
  top: var(--pad);
  left: var(--pad);
  width: calc(var(--h) - var(--pad) * 2);
  height: calc(var(--h) - var(--pad) * 2);
  border-radius: 999px;
  background: var(--knob);
  box-shadow: var(--elev-knob);
  transition: transform var(--dur-short) var(--ease-out);
}
.ui-switch[aria-checked='true'] .knob {
  transform: translateX(calc(var(--w) - var(--h)));
}
.ui-switch:hover:not(:disabled) .knob {
  box-shadow: var(--elev-knob-hover);
}
.ui-switch:active:not(:disabled) .knob {
  transform: scaleX(1.15);
  transform-origin: left center;
}
.ui-switch[aria-checked='true']:active:not(:disabled) .knob {
  transform: translateX(calc(var(--w) - var(--h))) scaleX(1.15);
  transform-origin: right center;
}
.ui-switch:disabled {
  opacity: 0.45;
}
</style>
