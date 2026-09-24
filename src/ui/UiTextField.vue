<script setup lang="ts">
import { useId } from 'vue'

import { stripGlyphs } from './glyphs/text'
import IconText from './IconText.vue'

/**
 * Labelled text field. Error text replaces the hint and turns the ring red;
 * `multiline` renders a textarea.
 */
const value = defineModel<string>({ default: '' })
withDefaults(
  defineProps<{
    label: string
    type?: string
    placeholder?: string
    hint?: string
    error?: string
    multiline?: boolean
    rows?: number
    disabled?: boolean
    hideLabel?: boolean
    platform?: 'mac' | 'ios'
  }>(),
  { type: 'text', rows: 4, platform: 'mac' },
)
const id = useId()
</script>

<template>
  <div class="field" :class="[`is-${platform}`, { 'has-error': error }]">
    <label :for="id" class="label" :class="{ 'sr-only': hideLabel }"><IconText :text="label" /></label>
    <textarea
      v-if="multiline"
      :id="id"
      v-model="value"
      class="control"
      :rows="rows"
      :placeholder="placeholder && stripGlyphs(placeholder)"
      :disabled="disabled"
      :aria-invalid="!!error || undefined"
      :aria-describedby="error || hint ? `${id}-note` : undefined"
    />
    <input
      v-else
      :id="id"
      v-model="value"
      class="control"
      :type="type"
      :placeholder="placeholder && stripGlyphs(placeholder)"
      :disabled="disabled"
      :aria-invalid="!!error || undefined"
      :aria-describedby="error || hint ? `${id}-note` : undefined"
    />
    <p v-if="error || hint" :id="`${id}-note`" class="note" :role="error ? 'alert' : undefined">
      <IconText :text="error || hint || ''" />
    </p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.label {
  font-size: var(--text-callout);
  font-weight: 500;
  color: var(--label-secondary);
}
.control {
  width: 100%;
  min-height: 24px;
  padding: 3px 8px;
  border-radius: var(--radius-field);
  background: var(--text-background);
  box-shadow: var(--elev-control);
  color: var(--label);
  font-size: var(--text-body);
  line-height: var(--text-body--line-height);
  resize: vertical;
  outline: none;
}
.is-ios .control {
  min-height: 44px;
  padding: 11px 14px;
  border-radius: 12px;
  background: var(--ios-bg-grouped-secondary);
  box-shadow: none;
  font-size: var(--text-ios-body);
  line-height: var(--text-ios-body--line-height);
}
.control:hover:not(:disabled) {
  box-shadow:
    var(--elev-control),
    0 0 0 0.5px var(--label-tertiary);
}
.control:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 0;
}
.control:disabled {
  color: var(--label-tertiary);
}
.note {
  font-size: var(--text-subheadline);
  color: var(--label-secondary);
}
.has-error .control {
  outline: 2px solid color-mix(in srgb, var(--sys-red) 60%, transparent);
}
.has-error .note {
  color: var(--sys-red);
}
</style>
