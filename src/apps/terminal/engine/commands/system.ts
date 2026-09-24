import type { CommandContext, CommandSpec } from '../command'
import type { Span } from '../types'

const flag = (ctx: CommandContext, name: string) => ctx.args.includes(name)

function uptimeText(ctx: CommandContext): string {
  const ms = ctx.now().getTime() - ctx.shell.startedAt.getTime()
  const minutes = Math.max(1, Math.floor(ms / 60000))
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`
}

const whoami: CommandSpec = {
  name: 'whoami',
  group: 'system',
  summary: 'Show current user',
  run: (ctx) => ctx.out.print(ctx.shell.user),
}

const date: CommandSpec = {
  name: 'date',
  group: 'system',
  summary: 'Show current date/time',
  run: (ctx) => ctx.out.print(ctx.now().toString()),
}

const uptime: CommandSpec = {
  name: 'uptime',
  group: 'system',
  summary: 'Show system uptime',
  run(ctx) {
    const now = ctx.now()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    ctx.out.print(`${time}  up ${uptimeText(ctx)}, 1 user, load averages: 1.42 1.69 1.83`)
  },
}

const uname: CommandSpec = {
  name: 'uname',
  group: 'system',
  usage: 'uname [-a]',
  summary: 'Show system info',
  run(ctx) {
    const info = ctx.content.uname[ctx.shell.platform]
    ctx.out.print(flag(ctx, '-a') ? info.all : info.short)
  },
}

const ps: CommandSpec = {
  name: 'ps',
  group: 'system',
  summary: 'Show running processes',
  run: (ctx) => ctx.out.content(ctx.content.blocks.ps ?? []),
}

const top: CommandSpec = {
  name: 'top',
  group: 'system',
  summary: 'Show system activity',
  run: (ctx) => ctx.out.content(ctx.content.blocks.top ?? []),
}

const df: CommandSpec = {
  name: 'df',
  group: 'system',
  usage: 'df [-h]',
  summary: 'Show disk usage',
  run: (ctx) => ctx.out.content((flag(ctx, '-h') ? ctx.content.blocks.dfHuman : ctx.content.blocks.df) ?? []),
}

const du: CommandSpec = {
  name: 'du',
  group: 'system',
  usage: 'du [-h]',
  summary: 'Show directory sizes',
  run: (ctx) => ctx.out.content((flag(ctx, '-h') ? ctx.content.blocks.duHuman : ctx.content.blocks.du) ?? []),
}

const history: CommandSpec = {
  name: 'history',
  group: 'system',
  summary: 'Show command history',
  run(ctx) {
    ctx.shell.history.forEach((entry, i) => ctx.out.print(`${String(i + 1).padStart(5)}  ${entry}`))
  },
}

const which: CommandSpec = {
  name: 'which',
  group: 'system',
  usage: 'which <cmd>',
  summary: 'Locate command',
  run(ctx) {
    if (!ctx.args.length) {
      ctx.out.error('which: missing argument')
      return 1
    }
    let status = 0
    for (const cmd of ctx.args) {
      const path = ctx.content.which[cmd]
      if (path) ctx.out.print(path)
      else {
        ctx.out.error(`${cmd} not found`)
        status = 1
      }
    }
    return status
  },
}

/** The About window's "system information", printed next to the bolt. */
const neofetch: CommandSpec = {
  name: 'neofetch',
  aliases: ['fastfetch'],
  group: 'system',
  summary: 'System info, with the logo',
  run(ctx) {
    const { content, shell } = ctx
    const title = `${shell.user}@${shell.host}`
    const info: Span[][] = [
      [{ text: title, tone: 'yellow', bold: true }],
      [{ text: '-'.repeat(title.length), tone: 'dim' }],
      ...content.neofetch.map((row): Span[] => [
        { text: `${row.label}: `, tone: 'yellow', bold: true },
        { text: row.value === '{uptime}' ? uptimeText(ctx) : row.value },
      ]),
      [],
      content.links.flatMap((link, i): Span[] => [
        ...(i ? [{ text: '  ' }] : []),
        { text: link.label, tone: 'cyan', href: link.href },
      ]),
    ]
    // Narrow screens (phones) get the logo above the info instead of beside it.
    const sideBySide = shell.columns >= 56
    const logoWidth = Math.max(...content.logo.map((l) => l.length)) + 3
    if (!sideBySide) {
      for (const line of content.logo) ctx.out.print(line, 'yellow')
      ctx.out.print()
    }
    const rows = sideBySide ? Math.max(content.logo.length, info.length) : info.length
    for (let i = 0; i < rows; i++) {
      const spans: Span[] = []
      if (sideBySide) spans.push({ text: (content.logo[i] ?? '').padEnd(logoWidth), tone: 'yellow' })
      spans.push(...(info[i] ?? []))
      ctx.out.spans(spans)
    }
  },
}

export const systemCommands: CommandSpec[] = [
  whoami,
  date,
  uptime,
  uname,
  ps,
  top,
  df,
  du,
  history,
  which,
  neofetch,
]
