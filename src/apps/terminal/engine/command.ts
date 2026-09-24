import type { VirtualFs } from './fs'
import type { Output } from './output'
import type { CommandGroup, Platform, TerminalContent } from './types'

/** The slice of the shell a command may read or change. */
export interface ShellApi {
  readonly user: string
  readonly host: string
  readonly home: string
  readonly fs: VirtualFs
  readonly platform: Platform
  readonly history: readonly string[]
  readonly theme: string
  readonly startedAt: Date
  cwd: string
  previousCwd: string | null
  /** Terminal width in characters, for layout-sensitive output (ls columns). */
  columns: number
  resolve(path: string): string
  display(path: string): string
  /** Run another command line (used by `please` / `sudo`). Returns its status. */
  dispatch(name: string, args: string[], out: Output, stdin: string[] | null, tty?: boolean): number
}

export interface CommandContext {
  name: string
  args: string[]
  /** Text piped in from the previous command, if any. */
  stdin: string[] | null
  /** False when output is piped into another command (ls then prints one name per line). */
  tty: boolean
  shell: ShellApi
  content: TerminalContent
  out: Output
  random: () => number
  now: () => Date
}

export interface CommandSpec {
  name: string
  /** Extra names that run the same command. */
  aliases?: string[]
  /** Help section. Commands without a group are easter eggs and stay out of `help`. */
  group?: CommandGroup
  /** Left column in `help`, e.g. `ls [-la]`. Defaults to the name. */
  usage?: string
  summary?: string
  /** Return a non-zero status on failure; `&&` stops on it. */
  run: (ctx: CommandContext) => number | void
}

export const pick = <T>(list: readonly T[], random: () => number): T =>
  list[Math.floor(random() * list.length)] as T
