import type { CommandContext, CommandSpec } from '../command'
import { formatLsDate, formatSize, type FsDir, type FsNode } from '../fs'
import type { Span } from '../types'

const flagsOf = (args: string[]) => new Set(args.filter((a) => a.startsWith('-')).flatMap((a) => [...a.slice(1)]))
const operands = (args: string[]) => args.filter((a) => !a.startsWith('-') || a === '-')

/** Directories blue, executables green, like `ls -G` on macOS. */
function nameSpan(node: FsNode, suffix = true): Span {
  if (node.kind === 'dir') return { text: suffix ? `${node.name}/` : node.name, tone: 'blue', bold: true }
  if (node.mode.includes('x')) return { text: node.name, tone: 'green' }
  return { text: node.name }
}

function longRow(node: FsNode, widths: { owner: number; size: number }): Span[] {
  const size = formatSize(node.kind === 'dir' ? 4096 : node.size)
  return [
    {
      text: `${node.mode}  1 ${node.owner.padEnd(widths.owner)}  staff  ${size.padStart(widths.size)} ${formatLsDate(node.modified)} `,
    },
    nameSpan(node, false),
  ]
}

function listDir(ctx: CommandContext, dir: FsDir, long: boolean, all: boolean) {
  const entries = ctx.shell.fs.list(dir, all)
  if (long) {
    const widths = {
      owner: Math.max(...entries.map((e) => e.owner.length), 4),
      size: Math.max(...entries.map((e) => formatSize(e.kind === 'dir' ? 4096 : e.size).length), 2),
    }
    ctx.out.print(`total ${entries.length}`)
    for (const entry of entries) ctx.out.spans(longRow(entry, widths))
    return
  }
  if (!entries.length) return
  if (!ctx.tty) {
    for (const entry of entries) ctx.out.print(entry.name)
    return
  }
  // Columns sized to the longest name, filled row by row to fit the width.
  const cell = Math.max(...entries.map((e) => e.name.length + (e.kind === 'dir' ? 1 : 0))) + 2
  const perRow = Math.max(1, Math.floor(ctx.shell.columns / cell))
  for (let i = 0; i < entries.length; i += perRow) {
    const row = entries.slice(i, i + perRow)
    const spans: Span[] = []
    row.forEach((entry, j) => {
      const span = nameSpan(entry)
      spans.push(span)
      if (j < row.length - 1) spans.push({ text: ' '.repeat(cell - span.text.length) })
    })
    ctx.out.spans(spans)
  }
}

const ls: CommandSpec = {
  name: 'ls',
  group: 'files',
  usage: 'ls [-la]',
  summary: 'List directory contents',
  run(ctx) {
    const flags = flagsOf(ctx.args)
    const targets = operands(ctx.args)
    const paths = targets.length ? targets : ['.']
    let status = 0
    paths.forEach((path, index) => {
      const node = ctx.shell.fs.get(ctx.shell.resolve(path))
      if (!node) {
        ctx.out.error(`ls: ${path}: No such file or directory`)
        status = 1
        return
      }
      if (paths.length > 1 && node.kind === 'dir') {
        if (index > 0) ctx.out.print()
        ctx.out.print(`${path}:`)
      }
      if (node.kind === 'file') {
        if (flags.has('l')) ctx.out.spans(longRow(node, { owner: node.owner.length, size: 2 }))
        else ctx.out.spans([nameSpan(node)])
      } else {
        listDir(ctx, node, flags.has('l'), flags.has('a'))
      }
    })
    return status
  },
}

const cd: CommandSpec = {
  name: 'cd',
  group: 'files',
  usage: 'cd [path]',
  summary: 'Change directory',
  run(ctx) {
    const { shell } = ctx
    const input = ctx.args[0]
    if (input === '-') {
      if (!shell.previousCwd) {
        ctx.out.error('cd: no previous directory')
        return 1
      }
      const target = shell.previousCwd
      shell.previousCwd = shell.cwd
      shell.cwd = target
      ctx.out.print(shell.display(target))
      return 0
    }
    const target = shell.resolve(input ?? shell.home)
    const node = shell.fs.get(target)
    if (!node) {
      ctx.out.error(`cd: no such file or directory: ${input}`)
      return 1
    }
    if (node.kind !== 'dir') {
      ctx.out.error(`cd: not a directory: ${input}`)
      return 1
    }
    if (target !== shell.cwd) shell.previousCwd = shell.cwd
    shell.cwd = target
    return 0
  },
}

const pwd: CommandSpec = {
  name: 'pwd',
  group: 'files',
  summary: 'Print working directory',
  run: (ctx) => ctx.out.print(ctx.shell.cwd),
}

const mkdir: CommandSpec = {
  name: 'mkdir',
  group: 'files',
  usage: 'mkdir <dir>',
  summary: 'Create directory',
  run(ctx) {
    const targets = operands(ctx.args)
    if (!targets.length) {
      ctx.out.error('mkdir: missing operand')
      return 1
    }
    let status = 0
    for (const path of targets) {
      const result = ctx.shell.fs.mkdir(ctx.shell.resolve(path), ctx.now())
      if (result === 'exists') ctx.out.error(`mkdir: ${path}: File exists`)
      if (result === 'no-parent') ctx.out.error(`mkdir: ${path}: No such file or directory`)
      if (result !== 'ok') status = 1
    }
    return status
  },
}

const cat: CommandSpec = {
  name: 'cat',
  group: 'files',
  usage: 'cat <file>',
  summary: 'Display file contents',
  run(ctx) {
    const targets = operands(ctx.args)
    if (!targets.length) {
      if (ctx.stdin) {
        for (const line of ctx.stdin) ctx.out.print(line)
        return 0
      }
      ctx.out.error('cat: missing file operand')
      return 1
    }
    let status = 0
    for (const path of targets) {
      const node = ctx.shell.fs.get(ctx.shell.resolve(path))
      if (!node) {
        ctx.out.error(`cat: ${path}: No such file or directory`)
        status = 1
      } else if (node.kind === 'dir') {
        ctx.out.error(`cat: ${path}: Is a directory`)
        status = 1
      } else if (node.content) {
        ctx.out.print(node.content)
      }
    }
    return status
  },
}

const touch: CommandSpec = {
  name: 'touch',
  group: 'files',
  usage: 'touch <file>',
  summary: 'Create/update file',
  run(ctx) {
    const targets = operands(ctx.args)
    if (!targets.length) {
      ctx.out.error('touch: missing file operand')
      return 1
    }
    let status = 0
    for (const path of targets) {
      if (ctx.shell.fs.touch(ctx.shell.resolve(path), ctx.now()) === 'no-parent') {
        ctx.out.error(`touch: ${path}: No such file or directory`)
        status = 1
      }
    }
    return status
  },
}

const tree: CommandSpec = {
  name: 'tree',
  group: 'files',
  usage: 'tree [path]',
  summary: 'Show a directory as a tree',
  run(ctx) {
    const path = operands(ctx.args)[0] ?? '.'
    const all = flagsOf(ctx.args).has('a')
    const node = ctx.shell.fs.get(ctx.shell.resolve(path))
    if (!node || node.kind !== 'dir') {
      ctx.out.error(`${path} [error opening dir]`)
      return 1
    }
    let dirs = 0
    let files = 0
    const walk = (dir: FsDir, prefix: string) => {
      const entries = ctx.shell.fs.list(dir, all)
      entries.forEach((entry, i) => {
        const last = i === entries.length - 1
        ctx.out.spans([{ text: `${prefix}${last ? '└── ' : '├── '}` , tone: 'dim' }, nameSpan(entry, false)])
        if (entry.kind === 'dir') {
          dirs++
          walk(entry, `${prefix}${last ? '    ' : '│   '}`)
        } else {
          files++
        }
      })
    }
    ctx.out.spans([{ text: path, tone: 'blue', bold: true }])
    walk(node, '')
    ctx.out.print()
    ctx.out.print(`${dirs} ${dirs === 1 ? 'directory' : 'directories'}, ${files} ${files === 1 ? 'file' : 'files'}`)
    return 0
  },
}

/** `*` and `?` globs, anchored like find's -name. */
function globToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')
  return new RegExp(`^${escaped}$`)
}

const find: CommandSpec = {
  name: 'find',
  group: 'files',
  usage: 'find [path] -name <glob>',
  summary: 'Search for files by name',
  run(ctx) {
    const args = [...ctx.args]
    const nameAt = args.indexOf('-name')
    const pattern = nameAt >= 0 ? args[nameAt + 1] : undefined
    if (nameAt >= 0) args.splice(nameAt, 2)
    const start = args[0] ?? '.'
    const root = ctx.shell.fs.get(ctx.shell.resolve(start))
    if (!root) {
      ctx.out.error(`find: ${start}: No such file or directory`)
      return 1
    }
    const matcher = pattern ? globToRegExp(pattern) : null
    const walk = (node: FsNode, path: string) => {
      if (!matcher || matcher.test(node.name)) ctx.out.print(path)
      if (node.kind === 'dir') {
        for (const child of ctx.shell.fs.list(node, true)) walk(child, `${path}/${child.name}`)
      }
    }
    walk(root, start === '/' ? '' : start)
    return 0
  },
}

const echo: CommandSpec = {
  name: 'echo',
  group: 'files',
  usage: 'echo <text>',
  summary: 'Print text ($USER, $HOME, $PWD work)',
  run: (ctx) => ctx.out.print(ctx.args.join(' ')),
}

export const fileCommands: CommandSpec[] = [ls, cd, pwd, mkdir, cat, touch, tree, find, echo]

