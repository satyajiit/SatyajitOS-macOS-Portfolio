/**
 * Terminal engine types. The engine is plain TypeScript (no Vue, no DOM) so it
 * can be unit-tested and shared by the Mac Terminal and the phone's Termux.
 */

/** Colours map 1:1 to the --term-* design tokens. */
export type Tone = 'fg' | 'dim' | 'green' | 'blue' | 'yellow' | 'red' | 'magenta' | 'cyan'

export interface Span {
  text: string
  tone?: Tone
  bold?: boolean
  /** Rendered as a link (opens in a new tab). */
  href?: string
}

export interface OutputLine {
  kind: 'output'
  spans: Span[]
}

export interface PromptParts {
  user: string
  host: string
  /** Display path: `~`, `~/Projects`, `/etc`. */
  path: string
}

/** An echoed command line in the scrollback. */
export interface PromptLine {
  kind: 'prompt'
  prompt: PromptParts
  input: string
  /** Ctrl+C was pressed on this line (shows `^C`). */
  interrupted?: boolean
}

export type Line = OutputLine | PromptLine

export type Platform = 'desktop' | 'mobile'

/** Side effects the host UI performs; the engine only describes them. */
export type Effect =
  | { type: 'clear' }
  | { type: 'exit' }
  | { type: 'theme'; theme: string }
  | { type: 'later'; delay: number; lines: OutputLine[] }

export interface RunResult {
  lines: OutputLine[]
  effects: Effect[]
  /** Exit status of the last command (0 = success, 127 = not found). */
  status: number
}

/** A content line: plain text, or [tone, text]. */
export type ContentLine = string | [Tone, string]

export interface FsFileSpec {
  kind: 'file'
  content: string
  mode?: string
  size?: number
  owner?: string
}

export interface FsDirSpec {
  kind: 'dir'
  mode?: string
  owner?: string
  children: Record<string, FsNodeSpec>
}

export type FsNodeSpec = FsFileSpec | FsDirSpec

export interface TerminalTheme {
  name: string
  /** Design-token names (without `--`), e.g. `term-green`, `sys-orange`. */
  primary: string
  secondary: string
}

/** Everything the commands print that is content rather than logic. */
export interface TerminalContent {
  user: string
  fullName: string
  firstName: string
  email: string
  osName: string
  home: string
  hosts: Record<Platform, string>
  links: { label: string; href: string }[]
  fs: FsDirSpec
  banner: Record<Platform, ContentLine[]>
  helpHeader: string
  helpFooter: ContentLine[]
  helpGroups: Record<CommandGroup, string>
  aliasList: string[]
  fortunes: string[]
  jokes: string[]
  quotes: string[]
  motivations: string[]
  weather: { conditions: string[]; temps: number[]; forecasts: string[] }
  crypto: { name: string; symbol: string; min: number; spread: number }[]
  notFound: string[]
  neofetch: { label: string; value: string }[]
  logo: string[]
  themes: Record<string, TerminalTheme>
  defaultTheme: Record<Platform, string>
  blocks: Record<string, ContentLine[]>
  man: Record<string, string[]>
  which: Record<string, string>
  uname: Record<Platform, { short: string; all: string }>
}

export type CommandGroup = 'files' | 'system' | 'dev' | 'fun' | 'utils'
