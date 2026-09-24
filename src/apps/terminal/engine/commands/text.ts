import type { CommandContext, CommandSpec } from '../command'
import type { Span } from '../types'

/** Lines from stdin, or from the files named in the operands. */
function input(ctx: CommandContext, files: string[]): string[] | null {
  if (!files.length) return ctx.stdin ?? []
  const lines: string[] = []
  for (const path of files) {
    const node = ctx.shell.fs.get(ctx.shell.resolve(path))
    if (!node || node.kind !== 'file') {
      ctx.out.error(`${ctx.name}: ${path}: ${node ? 'Is a directory' : 'No such file or directory'}`)
      return null
    }
    lines.push(...node.content.split('\n'))
  }
  return lines
}

function countFlag(args: string[]): { n: number; rest: string[] } {
  const rest = [...args]
  let n = 10
  const at = rest.findIndex((a) => a === '-n' || /^-\d+$/.test(a))
  if (at >= 0) {
    const arg = rest[at]!
    n = arg === '-n' ? Number(rest[at + 1]) : Number(arg.slice(1))
    rest.splice(at, arg === '-n' ? 2 : 1)
  }
  return { n: Number.isFinite(n) ? n : 10, rest }
}

const grep: CommandSpec = {
  name: 'grep',
  group: 'utils',
  usage: 'grep [-i] <text> [file]',
  summary: 'Find lines (works with | pipes)',
  run(ctx) {
    const ignoreCase = ctx.args.includes('-i')
    const [pattern, ...files] = ctx.args.filter((a) => a !== '-i')
    if (!pattern) {
      ctx.out.error('usage: grep [-i] pattern [file ...]')
      return 2
    }
    const lines = input(ctx, files)
    if (!lines) return 2
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(escaped, ignoreCase ? 'gi' : 'g')
    let found = 0
    for (const line of lines) {
      if (!line.match(re)) continue
      found++
      // Highlight matches the way `grep --color` does.
      const spans: Span[] = []
      let last = 0
      for (const m of line.matchAll(re)) {
        if (m.index > last) spans.push({ text: line.slice(last, m.index) })
        spans.push({ text: m[0], tone: 'red', bold: true })
        last = m.index + m[0].length
      }
      if (last < line.length) spans.push({ text: line.slice(last) })
      ctx.out.spans(spans)
    }
    return found ? 0 : 1
  },
}

const head: CommandSpec = {
  name: 'head',
  group: 'utils',
  usage: 'head [-n N] [file]',
  summary: 'First lines',
  run(ctx) {
    const { n, rest } = countFlag(ctx.args)
    const lines = input(ctx, rest)
    if (!lines) return 1
    for (const line of lines.slice(0, n)) ctx.out.print(line)
  },
}

const tail: CommandSpec = {
  name: 'tail',
  group: 'utils',
  usage: 'tail [-n N] [file]',
  summary: 'Last lines',
  run(ctx) {
    const { n, rest } = countFlag(ctx.args)
    const lines = input(ctx, rest)
    if (!lines) return 1
    for (const line of lines.slice(-n)) ctx.out.print(line)
  },
}

const wc: CommandSpec = {
  name: 'wc',
  group: 'utils',
  usage: 'wc [-l] [file]',
  summary: 'Count lines, words, chars',
  run(ctx) {
    const onlyLines = ctx.args.includes('-l')
    const lines = input(
      ctx,
      ctx.args.filter((a) => !a.startsWith('-')),
    )
    if (!lines) return 1
    const text = lines.join('\n')
    const words = text.split(/\s+/).filter(Boolean).length
    const pad = (n: number) => String(n).padStart(8)
    ctx.out.print(onlyLines ? pad(lines.length) : `${pad(lines.length)}${pad(words)}${pad(text.length + 1)}`)
  },
}

const sort: CommandSpec = {
  name: 'sort',
  group: 'utils',
  usage: 'sort [-r] [file]',
  summary: 'Sort lines',
  run(ctx) {
    const lines = input(
      ctx,
      ctx.args.filter((a) => !a.startsWith('-')),
    )
    if (!lines) return 1
    const sorted = [...lines].sort((a, b) => a.localeCompare(b))
    if (ctx.args.includes('-r')) sorted.reverse()
    for (const line of sorted) ctx.out.print(line)
  },
}

export const textCommands: CommandSpec[] = [grep, head, tail, wc, sort]
