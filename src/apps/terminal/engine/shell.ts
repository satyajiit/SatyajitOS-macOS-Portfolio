import { COMMANDS, ALIASES, findCommand } from './commands'
import { pick, type ShellApi } from './command'
import { complete, type Completion } from './complete'
import { displayPath, resolvePath, VirtualFs } from './fs'
import { contentLine, lineText, Output, textLine } from './output'
import { parse } from './parse'
import type { OutputLine, Platform, PromptParts, RunResult, TerminalContent } from './types'

export interface ShellOptions {
  content: TerminalContent
  platform: Platform
  /** Injected for deterministic tests. */
  random?: () => number
  now?: () => Date
  columns?: number
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Levenshtein distance, for "did you mean" suggestions. */
function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]!
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const temp = row[j]!
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = temp
    }
  }
  return row[b.length]!
}

/**
 * One terminal session: cwd, history, theme and a private file system.
 * The UI asks it to `run` a line and renders the lines/effects that come back.
 */
export class Shell implements ShellApi {
  readonly user: string
  readonly host: string
  readonly home: string
  readonly fs: VirtualFs
  readonly platform: Platform
  readonly startedAt: Date
  readonly history: string[] = []
  cwd: string
  previousCwd: string | null = null
  columns: number
  theme: string

  private readonly content: TerminalContent
  private readonly random: () => number
  private readonly now: () => Date

  constructor(options: ShellOptions) {
    this.content = options.content
    this.platform = options.platform
    this.random = options.random ?? Math.random
    this.now = options.now ?? (() => new Date())
    this.columns = options.columns ?? 80
    this.user = this.content.user
    this.host = this.content.hosts[this.platform]
    this.home = this.content.home
    this.startedAt = this.now()
    this.fs = new VirtualFs(this.content.fs, this.user, this.startedAt)
    this.cwd = this.home
    this.theme = this.content.defaultTheme[this.platform]
  }

  resolve(path: string): string {
    return resolvePath(path, this.cwd, this.home)
  }

  display(path: string): string {
    return displayPath(path, this.home)
  }

  prompt(): PromptParts {
    return { user: this.user, host: this.host, path: this.display(this.cwd) }
  }

  private vars(): Record<string, string> {
    return {
      os: this.content.osName,
      name: this.content.fullName,
      firstName: this.content.firstName,
      email: this.content.email,
      user: this.user,
      theme: this.content.themes[this.theme]?.name ?? this.theme,
    }
  }

  /** The lines a fresh window opens with ("Last login: …" on the Mac). */
  banner(): OutputLine[] {
    const lines: OutputLine[] = []
    if (this.platform === 'desktop') {
      const d = this.startedAt
      const time = [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => String(n).padStart(2, '0')).join(':')
      lines.push(textLine(`Last login: ${DAYS[d.getDay()]} ${MONTHS[d.getMonth()]} ${d.getDate()} ${time} on ttys000`))
    }
    const vars = this.vars()
    for (const line of this.content.banner[this.platform]) lines.push(contentLine(line, vars))
    return lines
  }

  /** Run a command line. `record: false` keeps UI-triggered commands out of history. */
  run(input: string, { record = true }: { record?: boolean } = {}): RunResult {
    const out = new Output(this.vars())
    const trimmed = input.trim()
    if (!trimmed) return { lines: [], effects: [], status: 0 }
    if (record && this.history.at(-1) !== trimmed) this.history.push(trimmed)

    const parsed = parse(trimmed, {
      home: this.home,
      vars: { USER: this.user, HOME: this.home, PWD: this.cwd, SHELL: '/bin/zsh' },
    })
    if (!parsed.ok) {
      out.error(parsed.error)
      return { lines: out.lines, effects: out.effects, status: 1 }
    }

    let status = 0
    parsed.steps.forEach((step, i) => {
      if (i > 0 && parsed.steps[i - 1]!.next === '&&' && status !== 0) return
      let stdin: string[] | null = null
      step.commands.forEach((cmd, j) => {
        const last = j === step.commands.length - 1
        const target = last ? out : new Output(this.vars())
        status = this.dispatch(cmd.name, cmd.args, target, stdin, last)
        if (!last) stdin = target.lines.map(lineText)
      })
    })
    for (const effect of out.effects) if (effect.type === 'theme') this.theme = effect.theme
    return { lines: out.lines, effects: out.effects, status }
  }

  dispatch(name: string, args: string[], out: Output, stdin: string[] | null, tty = true): number {
    const alias = ALIASES[name]
    if (alias) return this.dispatch(alias[0]!, [...alias.slice(1), ...args], out, stdin, tty)

    const command = findCommand(name)
    if (!command) return this.notFound(name, out)
    const status = command.run({
      name,
      args,
      stdin,
      tty,
      shell: this,
      content: this.content,
      out,
      random: this.random,
      now: this.now,
    })
    return status ?? 0
  }

  private notFound(name: string, out: Output): number {
    out.error(pick(this.content.notFound, this.random).replaceAll('{cmd}', name))
    out.print("💡 Type 'help' to see available commands")
    out.print('🎲 Or try some fun commands: cowsay, fortune, joke, matrix!')
    const closest = COMMANDS.map((c) => ({ name: c.name, d: distance(name.toLowerCase(), c.name) }))
      .filter((c) => c.d <= 2)
      .sort((a, b) => a.d - b.d)[0]
    out.print(`🤔 Did you mean: ${closest?.name ?? 'help'}?`)
    return 127
  }

  complete(before: string): Completion {
    return complete(before, this)
  }
}
