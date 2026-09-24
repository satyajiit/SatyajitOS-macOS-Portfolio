import { ALIASES, commandNames } from './commands'
import type { ShellApi } from './command'

export interface Completion {
  /** The text before the caret after completing. */
  value: string
  /** Shown under the prompt when the completion is ambiguous. */
  candidates: string[]
}

function commonPrefix(words: string[]): string {
  if (!words.length) return ''
  let prefix = words[0]!
  for (const word of words) while (!word.startsWith(prefix)) prefix = prefix.slice(0, -1)
  return prefix
}

/**
 * Tab completion for the text before the caret: command names in command
 * position, otherwise paths relative to the cwd (directories only after `cd`).
 */
export function complete(before: string, shell: ShellApi): Completion {
  const match = /(^|[\s|;&])([^\s|;&]*)$/.exec(before)
  const token = match?.[2] ?? ''
  const head = before.slice(0, before.length - token.length)
  const context = head.trimEnd()
  const inCommandPosition = !context || /(\||;|&&)$/.test(context)

  if (inCommandPosition) {
    const names = commandNames().filter((name) => name.startsWith(token.toLowerCase()))
    if (names.length === 1) return { value: `${head}${names[0]} `, candidates: [] }
    const prefix = commonPrefix(names)
    return { value: head + (prefix.length > token.length ? prefix : token), candidates: names.length > 1 ? names : [] }
  }

  const command = context.split(/\s+/)[0] ?? ''
  const onlyDirs = command === 'cd' || ALIASES[command]?.[0] === 'cd'
  const slash = token.lastIndexOf('/')
  const dirPart = token.slice(0, slash + 1)
  const base = token.slice(slash + 1)
  const dir = shell.fs.get(shell.resolve(dirPart || '.'))
  if (!dir || dir.kind !== 'dir') return { value: before, candidates: [] }

  const matches = shell.fs
    .list(dir, base.startsWith('.'))
    .filter((node) => node.name.startsWith(base) && (!onlyDirs || node.kind === 'dir'))
  if (!matches.length) return { value: before, candidates: [] }

  if (matches.length === 1) {
    const only = matches[0]!
    return {
      value: `${head}${dirPart}${only.name}${only.kind === 'dir' ? '/' : ' '}`,
      candidates: [],
    }
  }
  const prefix = commonPrefix(matches.map((m) => m.name))
  return {
    value: `${head}${dirPart}${prefix.length > base.length ? prefix : base}`,
    candidates: matches.map((m) => (m.kind === 'dir' ? `${m.name}/` : m.name)),
  }
}
