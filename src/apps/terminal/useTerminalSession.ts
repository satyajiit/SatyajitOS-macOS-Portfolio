import { computed, nextTick, onBeforeUnmount, ref, shallowRef, type Ref } from 'vue'

import { useAnalytics } from '@/composables/useAnalytics'
import { terminalContent } from '@/content/terminal'

import { HistoryCursor, Shell, type Line, type OutputLine, type Platform, type PromptParts } from './engine'

/** Scrollback limit, like Terminal's "Limit number of rows". */
const MAX_LINES = 2000

/** Lay out completion candidates in columns, like zsh's list. */
function candidateLines(candidates: string[], columns: number): OutputLine[] {
  const cell = Math.max(...candidates.map((c) => c.length)) + 2
  const perRow = Math.max(1, Math.floor(columns / cell))
  const lines: OutputLine[] = []
  for (let i = 0; i < candidates.length; i += perRow) {
    const row = candidates.slice(i, i + perRow)
    lines.push({
      kind: 'output',
      spans: [{ text: row.map((c, j) => (j < row.length - 1 ? c.padEnd(cell) : c)).join('') }],
    })
  }
  return lines
}

/**
 * A live terminal session for one window: wraps the pure engine with
 * reactive scrollback, the line being edited, caret position and theme.
 */
export function useTerminalSession(platform: Platform, onExit: () => void) {
  const shell = new Shell({ content: terminalContent, platform })
  const lines = shallowRef<Line[]>(shell.banner())
  const input = ref('')
  const caret = ref(0)
  const prompt = ref<PromptParts>(shell.prompt())
  const theme = ref(shell.theme)
  const history = new HistoryCursor(() => shell.history)
  const timers = new Set<ReturnType<typeof setTimeout>>()
  const { trackTerminalCommand } = useAnalytics()

  const append = (next: Line[]) => {
    if (!next.length) return
    const all = lines.value.concat(next)
    lines.value = all.length > MAX_LINES ? all.slice(-MAX_LINES) : all
  }

  const setInput = (value: string, at = value.length) => {
    input.value = value
    caret.value = at
  }

  const later = (ms: number, fn: () => void) => {
    const timer = setTimeout(() => {
      timers.delete(timer)
      fn()
    }, ms)
    timers.add(timer)
  }

  function execute(command: string, { echo = true }: { echo?: boolean } = {}) {
    if (echo) append([{ kind: 'prompt', prompt: prompt.value, input: command }])
    const result = shell.run(command, { record: echo })
    if (echo && command.trim()) {
      trackTerminalCommand(command.trim(), platform === 'mobile' ? 'ios' : 'desktop')
    }
    if (result.effects.some((effect) => effect.type === 'clear')) lines.value = []
    else append(result.lines)
    for (const effect of result.effects) {
      if (effect.type === 'theme') theme.value = effect.theme
      if (effect.type === 'later') later(effect.delay, () => append(effect.lines))
      // Let the goodbye line render before the window goes away.
      if (effect.type === 'exit') later(600, onExit)
    }
    prompt.value = shell.prompt()
  }

  function submit() {
    const command = input.value
    setInput('')
    history.reset()
    execute(command)
  }

  /** Ctrl+C: abandon the line, show ^C, fresh prompt. */
  function interrupt() {
    append([{ kind: 'prompt', prompt: prompt.value, input: input.value, interrupted: true }])
    setInput('')
    history.reset()
  }

  function complete() {
    const before = input.value.slice(0, caret.value)
    const after = input.value.slice(caret.value)
    const result = shell.complete(before)
    if (result.candidates.length) {
      append([
        { kind: 'prompt', prompt: prompt.value, input: input.value },
        ...candidateLines(result.candidates, shell.columns),
      ])
    }
    setInput(result.value + after, result.value.length)
  }

  function historyPrev() {
    const value = history.prev(input.value)
    if (value !== null) setInput(value)
  }

  function historyNext() {
    const value = history.next()
    if (value !== null) setInput(value)
  }

  const clearScreen = () => (lines.value = [])

  const themeVars = computed(() => {
    const t = terminalContent.themes[theme.value] ?? terminalContent.themes.basic!
    return { '--t-primary': `var(--${t.primary})`, '--t-secondary': `var(--${t.secondary})` }
  })

  onBeforeUnmount(() => {
    for (const timer of timers) clearTimeout(timer)
    timers.clear()
  })

  return {
    shell,
    lines,
    input,
    caret,
    prompt,
    theme,
    themeVars,
    setInput,
    execute,
    submit,
    interrupt,
    complete,
    historyPrev,
    historyNext,
    clearScreen,
    setColumns: (columns: number) => (shell.columns = Math.max(20, columns)),
  }
}

export type TerminalSession = ReturnType<typeof useTerminalSession>

/**
 * Keyboard handling shared by both platforms. The real text lives in a
 * (visually hidden) <input>; this keeps the session's caret in sync with it
 * and maps the terminal shortcuts.
 */
export function useTerminalKeys(session: TerminalSession, field: Ref<HTMLInputElement | null>) {
  const syncCaret = () => {
    const el = field.value
    if (el) session.caret.value = el.selectionStart ?? session.input.value.length
  }

  const placeCaret = async () => {
    await nextTick()
    const el = field.value
    if (el && document.activeElement === el) el.setSelectionRange(session.caret.value, session.caret.value)
  }

  /** Ctrl+<key>, from a real keyboard or the phone's sticky CTRL key. Returns true if handled. */
  function control(key: string): boolean {
    switch (key.toLowerCase()) {
      case 'c':
        session.interrupt()
        break
      case 'l':
        session.clearScreen()
        break
      case 'u':
        session.setInput('')
        break
      case 'a':
        session.caret.value = 0
        break
      case 'e':
        session.caret.value = session.input.value.length
        break
      case 'd':
        if (session.input.value) return true
        session.setInput('exit')
        session.submit()
        break
      default:
        return false
    }
    void placeCaret()
    return true
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.isComposing) return
    if (event.ctrlKey && !event.metaKey && !event.altKey && event.key.length === 1) {
      if (control(event.key)) event.preventDefault()
      return
    }
    if (event.metaKey && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      session.clearScreen()
      return
    }
    switch (event.key) {
      case 'Enter':
        event.preventDefault()
        session.submit()
        break
      case 'Tab':
        event.preventDefault()
        session.complete()
        break
      case 'ArrowUp':
        event.preventDefault()
        session.historyPrev()
        break
      case 'ArrowDown':
        event.preventDefault()
        session.historyNext()
        break
      default:
        requestAnimationFrame(syncCaret)
        return
    }
    void placeCaret()
  }

  const moveCaret = (delta: number) => {
    session.caret.value = Math.min(Math.max(0, session.caret.value + delta), session.input.value.length)
    void placeCaret()
  }

  return { onKeydown, syncCaret, placeCaret, control, moveCaret }
}
