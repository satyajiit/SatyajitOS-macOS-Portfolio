import { pick, type CommandSpec } from '../command'
import type { CommandGroup } from '../types'

const man: CommandSpec = {
  name: 'man',
  group: 'utils',
  usage: 'man <cmd>',
  summary: 'Show manual page',
  run(ctx) {
    const [topic] = ctx.args
    if (!topic) {
      ctx.out.error('What manual page do you want?')
      ctx.out.print('For example, try: man ls')
      return 1
    }
    const page = ctx.content.man[topic]
    if (!page) {
      ctx.out.error(`No manual entry for ${topic}`)
      ctx.out.print(`Available manual pages: ${Object.keys(ctx.content.man).join(', ')}`)
      return 1
    }
    for (const line of page) ctx.out.print(line, /^[A-Z][A-Z ]+$/.test(line.trim()) ? 'fg' : undefined, /^[A-Z][A-Z ]+$/.test(line.trim()))
  },
}

const alias: CommandSpec = {
  name: 'alias',
  group: 'utils',
  summary: 'Show aliases',
  run(ctx) {
    if (!ctx.args.length) {
      ctx.out.print('Current aliases:')
      for (const line of ctx.content.aliasList) ctx.out.print(line)
      return
    }
    ctx.out.print('Setting custom aliases is not implemented yet!', 'yellow')
    ctx.out.print('But you can use the predefined aliases above! 😊')
  },
}

const theme: CommandSpec = {
  name: 'theme',
  group: 'utils',
  usage: 'theme [name|random]',
  summary: 'Change terminal theme',
  run(ctx) {
    const { themes } = ctx.content
    const [choice] = ctx.args
    if (!choice) {
      ctx.out.print(`Current theme: ${themes[ctx.shell.theme]?.name ?? ctx.shell.theme}`)
      ctx.out.print('Available themes:')
      for (const [key, value] of Object.entries(themes)) ctx.out.print(`  ${key.padEnd(10)} - ${value.name}`)
      ctx.out.print('Usage: theme <name> or theme random')
      return
    }
    let next = choice
    if (choice === 'random') {
      const others = Object.keys(themes).filter((key) => key !== ctx.shell.theme)
      next = pick(others, ctx.random)
    }
    if (!themes[next]) {
      ctx.out.error(`Theme '${choice}' not found. Use 'theme' to see available themes.`)
      return 1
    }
    ctx.out.effect({ type: 'theme', theme: next })
    ctx.out.print(`🎨 Theme changed to: ${themes[next]!.name}`, 'green')
  },
}

const status: CommandSpec = {
  name: 'status',
  group: 'utils',
  summary: 'Show terminal status',
  run(ctx) {
    const { shell, content } = ctx
    const minutes = Math.floor((ctx.now().getTime() - shell.startedAt.getTime()) / 60000)
    ctx.out.print('📊 Terminal Status Report:')
    ctx.out.print(`🎨 Current Theme: ${content.themes[shell.theme]?.name ?? shell.theme}`)
    ctx.out.print(shell.platform === 'mobile' ? '📱 Platform: iOS Mobile' : '💻 Platform: macOS Desktop')
    if (shell.platform === 'mobile') ctx.out.print('⌨️  Extra keys: Visible')
    ctx.out.print(`📝 Commands Executed: ${shell.history.length}`)
    ctx.out.print(`🕐 Session Time: ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`)
    ctx.out.print('✅ All systems operational', 'green')
  },
}

const clear: CommandSpec = {
  name: 'clear',
  aliases: ['cls'],
  group: 'utils',
  summary: 'Clear terminal',
  run: (ctx) => ctx.out.effect({ type: 'clear' }),
}

const exit: CommandSpec = {
  name: 'exit',
  aliases: ['logout'],
  group: 'utils',
  summary: 'Close the terminal',
  run(ctx) {
    ctx.out.content(ctx.content.blocks.exit ?? [])
    ctx.out.effect({ type: 'exit' })
  },
}

export const utilityCommands: CommandSpec[] = [man, alias, theme, status, clear, exit]

export const HELP_ORDER: CommandGroup[] = ['files', 'system', 'dev', 'fun', 'utils']
