<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'

import { useWindowContext, WindowTitlebar } from '@/ui/window'

import TerminalScreen from './TerminalScreen.vue'
import { useTerminalKeys, useTerminalSession } from './useTerminalSession'

/** Terminal.app with a dark profile: title shows cwd and the live grid size. */
const win = useWindowContext()
const session = useTerminalSession('desktop', () => win?.close())
const field = ref<HTMLInputElement | null>(null)
const screen = ref<HTMLElement | null>(null)
const probe = ref<HTMLElement | null>(null)
const keys = useTerminalKeys(session, field)
const focused = ref(false)
const grid = reactive({ cols: 80, rows: 24 })

const title = computed(() => {
  const path = session.prompt.value.path
  const where = path === '~' ? session.shell.user : path.slice(path.lastIndexOf('/') + 1) || '/'
  return `${where} — zsh — ${grid.cols}×${grid.rows}`
})

// Measure one character of the mono font to report columns × rows like Terminal does.
useResizeObserver(screen, () => {
  const el = screen.value
  const glyph = probe.value?.getBoundingClientRect()
  if (!el || !glyph?.width) return
  const style = getComputedStyle(el)
  const width = el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
  const height = el.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)
  grid.cols = Math.max(20, Math.floor(width / (glyph.width / 10)))
  grid.rows = Math.max(5, Math.floor(height / glyph.height))
  session.setColumns(grid.cols)
})

const focusInput = () => field.value?.focus({ preventScroll: true })

/** Click anywhere to type, but leave text selections alone so copy works. */
function onPointerUp() {
  if (window.getSelection()?.isCollapsed !== false) focusInput()
}

function scrollToEnd() {
  void nextTick(() => {
    if (screen.value) screen.value.scrollTop = screen.value.scrollHeight
  })
}

watch([session.lines, session.input], scrollToEnd)
watch(
  () => win?.isKey.value,
  (key) => {
    if (key) focusInput()
  },
)
onMounted(() => {
  focusInput()
  scrollToEnd()
})
</script>

<template>
  <WindowTitlebar :title="title" />
  <!-- The field sits outside the scroller: typing scrolls a focused input into view. -->
  <div class="relative flex min-h-0 flex-1 flex-col bg-term-bg" :style="session.themeVars.value">
    <div
      ref="screen"
      class="term min-h-0 flex-1 overflow-y-auto px-1.5 py-1 font-mono text-callout text-term-fg"
      @pointerup="onPointerUp"
    >
      <TerminalScreen
        :lines="session.lines.value"
        :prompt="session.prompt.value"
        :input="session.input.value"
        :caret="session.caret.value"
        :focused="focused && (win?.isKey.value ?? true)"
        variant="mac"
      />
    </div>
    <input
      ref="field"
      v-model="session.input.value"
      class="pointer-events-none absolute bottom-0 left-0 size-px opacity-0"
      type="text"
      aria-label="Terminal input"
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
      @keydown="keys.onKeydown"
      @input="keys.syncCaret"
      @select="keys.syncCaret"
      @focus="focused = true"
      @blur="focused = false"
    />
    <span
      ref="probe"
      class="pointer-events-none invisible absolute left-0 top-0 font-mono text-callout"
      aria-hidden="true"
      >MMMMMMMMMM</span
    >
  </div>
</template>

<style scoped>
.term ::selection {
  background: var(--selection);
  color: var(--label-on-accent);
}
</style>
