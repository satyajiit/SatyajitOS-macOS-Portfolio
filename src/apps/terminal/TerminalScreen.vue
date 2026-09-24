<script setup lang="ts">
import { computed } from 'vue'

import IconText from '@/ui/IconText.vue'

import type { Line, PromptParts, Span, Tone } from './engine'

/**
 * Renders scrollback plus the line being edited. `variant` switches the
 * prompt between macOS zsh (`user@host dir %`) and Termux bash (`user@host:~/dir$`).
 */
const props = defineProps<{
  lines: Line[]
  prompt: PromptParts
  input: string
  caret: number
  focused: boolean
  variant: 'mac' | 'termux'
}>()

const TONE_CLASS: Record<Tone, string> = {
  fg: 'text-term-fg',
  dim: 'text-term-dim',
  green: 'text-term-green',
  blue: 'text-term-blue',
  yellow: 'text-term-yellow',
  red: 'text-term-red',
  magenta: 'text-term-magenta',
  cyan: 'text-term-cyan',
}

const spanClass = (span: Span) => [span.tone ? TONE_CLASS[span.tone] : '', span.bold ? 'font-bold' : '']

/** zsh's %1~: just the last path component, `~` at home. */
const shortPath = (path: string) => (path === '~' || path === '/' ? path : path.slice(path.lastIndexOf('/') + 1))

/** Prompt as explicit segments so template whitespace can never change the spacing. */
function promptSegments(p: PromptParts): { text: string; cls?: string }[] {
  const who = `${p.user}@${p.host}`
  return props.variant === 'mac'
    ? [{ text: who, cls: 't-primary' }, { text: ' ' }, { text: shortPath(p.path), cls: 't-secondary' }, { text: ' % ' }]
    : [{ text: who, cls: 't-primary font-bold' }, { text: ':' }, { text: p.path, cls: 't-secondary font-bold' }, { text: '$ ' }]
}

const before = computed(() => props.input.slice(0, props.caret))
const under = computed(() => props.input.slice(props.caret, props.caret + 1))
const after = computed(() => props.input.slice(props.caret + 1))
</script>

<template>
  <div class="term-screen">
    <div role="log" aria-live="polite" aria-label="Terminal output">
      <div v-for="(line, i) in lines" :key="i" class="term-line">
        <template v-if="line.kind === 'prompt'">
          <span v-for="(seg, j) in promptSegments(line.prompt)" :key="j" :class="seg.cls">{{ seg.text }}</span>
          <span>{{ line.input }}</span>
          <span v-if="line.interrupted" class="text-term-dim">^C</span>
        </template>
        <template v-else>
          <template v-for="(span, j) in line.spans" :key="j">
            <a
              v-if="span.href"
              :href="span.href"
              target="_blank"
              rel="noopener noreferrer"
              class="term-link"
              :class="spanClass(span)"
              ><IconText :text="span.text" :tinted="false"
            /></a>
            <span v-else :class="spanClass(span)"><IconText :text="span.text" :tinted="false" /></span>
          </template>
          <span v-if="!line.spans.length || line.spans.every((s) => !s.text)">&#8203;</span>
        </template>
      </div>
    </div>

    <div class="term-line" aria-hidden="true">
      <span v-for="(seg, j) in promptSegments(prompt)" :key="j" :class="seg.cls">{{ seg.text }}</span>
      <span>{{ before }}</span
      ><span class="caret" :class="focused ? 'is-focused animate-caret' : 'is-idle'">{{ under || ' ' }}</span
      ><span>{{ after }}</span>
    </div>
  </div>
</template>

<style scoped>
.term-line {
  min-height: 1lh;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.t-primary {
  color: var(--t-primary, var(--term-fg));
}
.t-secondary {
  color: var(--t-secondary, var(--term-fg));
}

/* Block caret: solid while typing, hollow when the window loses focus. */
.caret {
  display: inline-block;
  min-width: 1ch;
}
.caret.is-focused {
  background: var(--term-cursor);
  color: var(--term-bg);
}
.caret.is-idle {
  box-shadow: inset 0 0 0 1px var(--term-cursor);
}

.term-link {
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 2px;
}
.term-link:hover {
  text-decoration-style: solid;
}
.term-link:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 1px;
}
</style>
