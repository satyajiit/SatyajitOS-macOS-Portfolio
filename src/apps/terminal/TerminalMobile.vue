<script setup lang="ts">
import { Palette, RotateCcw, X } from '@lucide/vue'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useMobileApp } from '@/ui/mobile/context'

import TerminalScreen from './TerminalScreen.vue'
import { useTerminalKeys, useTerminalSession } from './useTerminalSession'

/**
 * Termux, the phone terminal: full-screen, a real text field so the system
 * keyboard opens, and Termux's extra-keys row for what that keyboard lacks.
 */
const app = useMobileApp()
const session = useTerminalSession('mobile', () => app.close())
const field = ref<HTMLInputElement | null>(null)
const screen = ref<HTMLElement | null>(null)
const keys = useTerminalKeys(session, field)
const focused = ref(false)
const ctrlArmed = ref(false)
/** Height of the on-screen keyboard, so the extra keys sit right above it. */
const keyboardInset = ref(0)

type ExtraKey = { label: string; name: string; run: () => void }
const insert = (text: string) => {
  const { input, caret } = session
  session.setInput(input.value.slice(0, caret.value) + text + input.value.slice(caret.value), caret.value + text.length)
  void keys.placeCaret()
}
const EXTRA_KEYS: ExtraKey[][] = [
  [
    { label: 'ESC', name: 'Escape (hide keyboard)', run: () => field.value?.blur() },
    { label: '/', name: 'Slash', run: () => insert('/') },
    { label: '-', name: 'Hyphen', run: () => insert('-') },
    { label: '↑', name: 'Previous command', run: () => session.historyPrev() },
    { label: '|', name: 'Pipe', run: () => insert('|') },
  ],
  [
    { label: 'TAB', name: 'Tab (complete)', run: () => session.complete() },
    { label: 'CTRL', name: 'Control', run: () => (ctrlArmed.value = !ctrlArmed.value) },
    { label: '←', name: 'Cursor left', run: () => keys.moveCaret(-1) },
    { label: '↓', name: 'Next command', run: () => session.historyNext() },
    { label: '→', name: 'Cursor right', run: () => keys.moveCaret(1) },
  ],
]

function press(key: ExtraKey) {
  key.run()
  if (key.label !== 'ESC') {
    field.value?.focus({ preventScroll: true })
    void keys.placeCaret()
  }
}

/** With CTRL armed, the next typed letter becomes a control key (Ctrl+C, Ctrl+L…). */
function onBeforeInput(event: InputEvent) {
  if (!ctrlArmed.value || !event.data) return
  event.preventDefault()
  ctrlArmed.value = false
  keys.control(event.data.slice(-1))
}

function onKeydown(event: KeyboardEvent) {
  if (ctrlArmed.value && event.key.length === 1) {
    event.preventDefault()
    ctrlArmed.value = false
    keys.control(event.key)
    return
  }
  keys.onKeydown(event)
}

function focusInput() {
  if (window.getSelection()?.isCollapsed !== false) field.value?.focus({ preventScroll: true })
}

function scrollToEnd() {
  void nextTick(() => {
    if (screen.value) screen.value.scrollTop = screen.value.scrollHeight
  })
}

function onViewport() {
  const vv = window.visualViewport
  if (!vv) return
  keyboardInset.value = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop))
  scrollToEnd()
}

function measureColumns() {
  const el = screen.value
  if (!el) return
  const probe = document.createElement('span')
  probe.textContent = 'MMMMMMMMMM'
  probe.style.visibility = 'hidden'
  el.appendChild(probe)
  const charWidth = probe.getBoundingClientRect().width / 10
  el.removeChild(probe)
  if (charWidth) session.setColumns(Math.floor((el.clientWidth - 16) / charWidth))
}

watch([session.lines, session.input], scrollToEnd)
onMounted(() => {
  measureColumns()
  scrollToEnd()
  window.visualViewport?.addEventListener('resize', onViewport)
  window.visualViewport?.addEventListener('scroll', onViewport)
})
onBeforeUnmount(() => {
  window.visualViewport?.removeEventListener('resize', onViewport)
  window.visualViewport?.removeEventListener('scroll', onViewport)
})
</script>

<template>
  <div
    class="termux relative flex h-full flex-col bg-term-bg font-mono text-term-fg"
    :style="[session.themeVars.value, { paddingBottom: keyboardInset ? `${keyboardInset}px` : undefined }]"
  >
    <header
      class="chrome flex shrink-0 items-center gap-2 border-b border-term-dim/25 pl-4 pr-1 pt-(--ios-status-height,0px)"
    >
      <span class="size-2 shrink-0 rounded-full bg-term-green" role="img" aria-label="Connected" />
      <span class="min-w-0 flex-1 truncate text-ios-footnote">
        <span class="t-primary font-bold">{{ session.shell.user }}@termux</span>
      </span>
      <button type="button" class="tool focus-ring" aria-label="Randomize theme" @click="session.execute('theme random', { echo: false })">
        <Palette aria-hidden="true" />
      </button>
      <button type="button" class="tool focus-ring" aria-label="Clear terminal" @click="session.clearScreen()">
        <RotateCcw aria-hidden="true" />
      </button>
      <button type="button" class="tool focus-ring" aria-label="Close Termux" @click="app.close()">
        <X aria-hidden="true" />
      </button>
    </header>

    <div
      ref="screen"
      class="min-h-0 flex-1 overflow-y-auto px-2 py-2 text-ios-footnote"
      style="letter-spacing: 0"
      @click="focusInput"
    >
      <TerminalScreen
        :lines="session.lines.value"
        :prompt="session.prompt.value"
        :input="session.input.value"
        :caret="session.caret.value"
        :focused="focused"
        variant="termux"
      />
    </div>

    <!-- A real field so iOS/Android raise the keyboard; 16px stops iOS zooming in on focus. -->
    <input
      ref="field"
      v-model="session.input.value"
      class="field"
      type="text"
      inputmode="text"
      enterkeyhint="send"
      aria-label="Terminal input"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      @keydown="onKeydown"
      @beforeinput="onBeforeInput"
      @input="keys.syncCaret"
      @select="keys.syncCaret"
      @focus="focused = true"
      @blur="focused = false"
    />

    <div
      class="chrome shrink-0 border-t border-term-dim/25"
      :style="{ paddingBottom: keyboardInset ? '0px' : 'max(env(safe-area-inset-bottom), 20px)' }"
      role="toolbar"
      aria-label="Extra keys"
    >
      <div v-for="(row, r) in EXTRA_KEYS" :key="r" class="grid grid-cols-5">
        <button
          v-for="key in row"
          :key="key.label"
          type="button"
          class="extra-key focus-ring"
          :aria-label="key.name"
          :aria-pressed="key.label === 'CTRL' ? ctrlArmed : undefined"
          @pointerdown.prevent
          @mousedown.prevent
          @click="press(key)"
        >
          {{ key.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.t-primary {
  color: var(--t-primary, var(--term-green));
}

.tool {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-control);
  color: var(--term-dim);
}
.tool svg {
  width: 18px;
  height: 18px;
}
.tool:active {
  color: var(--term-fg);
  background: color-mix(in srgb, var(--term-dim) 25%, transparent);
}

.field {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 1px;
  height: 1px;
  opacity: 0;
  font-size: 16px;
}

.extra-key {
  height: 44px;
  font-family: var(--font-mono);
  font-size: var(--text-ios-footnote);
  color: var(--term-fg);
  transition: background-color var(--dur-micro) var(--ease-out);
}
.extra-key:hover {
  background: color-mix(in srgb, var(--term-dim) 12%, transparent);
}
.extra-key:active {
  background: color-mix(in srgb, var(--term-dim) 30%, transparent);
}
.extra-key[aria-pressed='true'] {
  color: var(--term-bg);
  background: var(--t-primary, var(--term-green));
}
</style>
