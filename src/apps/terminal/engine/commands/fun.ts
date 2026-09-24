import { pick, type CommandContext, type CommandSpec } from '../command'
import type { ContentLine, Tone } from '../types'

const MATRIX_CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'

const block =
  (key: string): CommandSpec['run'] =>
  (ctx) =>
    ctx.out.content(ctx.content.blocks[key] ?? [])

const isRmRfRoot = (args: string[]) =>
  args.some((a) => /^-[a-z]*r[a-z]*f|^-[a-z]*f[a-z]*r/i.test(a)) && args.some((a) => a === '/' || a === '/*')

const cowsay: CommandSpec = {
  name: 'cowsay',
  group: 'fun',
  usage: 'cowsay <msg>',
  summary: 'ASCII cow says message',
  run(ctx) {
    const who = ctx.shell.platform === 'mobile' ? 'Termux' : ctx.content.osName
    const message = ctx.args.join(' ') || ctx.stdin?.join(' ') || `Hello from ${who}!`
    ctx.out.print(` ${'_'.repeat(message.length + 2)}`)
    ctx.out.print(`< ${message} >`)
    ctx.out.print(` ${'-'.repeat(message.length + 2)}`)
    ctx.out.print('        \\   ^__^')
    ctx.out.print('         \\  (oo)\\_______')
    ctx.out.print('            (__)\\       )\\/\\')
    ctx.out.print('                ||----w |')
    ctx.out.print('                ||     ||')
  },
}

const fortune: CommandSpec = {
  name: 'fortune',
  group: 'fun',
  summary: 'Random quote',
  run: (ctx) => ctx.out.print(pick(ctx.content.fortunes, ctx.random), 'green'),
}

const matrix: CommandSpec = {
  name: 'matrix',
  group: 'fun',
  summary: 'Enter the Matrix',
  run(ctx) {
    const width = Math.max(16, Math.min(50, ctx.shell.columns - 2))
    for (let row = 0; row < 10; row++) {
      let line = ''
      for (let col = 0; col < width; col++) line += MATRIX_CHARS[Math.floor(ctx.random() * MATRIX_CHARS.length)]
      ctx.out.print(line, 'green')
    }
    ctx.out.content(ctx.content.blocks.matrixOutro ?? [])
  },
}

const coffee: CommandSpec = {
  name: 'coffee',
  group: 'fun',
  summary: 'Brew virtual coffee',
  run: block('coffee'),
}

const joke: CommandSpec = {
  name: 'joke',
  group: 'fun',
  summary: 'Random programming joke',
  run: (ctx) => ctx.out.print(pick(ctx.content.jokes, ctx.random), 'green'),
}

const quote: CommandSpec = {
  name: 'quote',
  group: 'fun',
  summary: 'Inspirational quote',
  run: (ctx) => ctx.out.print(pick(ctx.content.quotes, ctx.random), 'green'),
}

const motivate: CommandSpec = {
  name: 'motivate',
  group: 'fun',
  summary: 'Get motivated!',
  run: (ctx) => ctx.out.print(pick(ctx.content.motivations, ctx.random), 'green'),
}

const weather: CommandSpec = {
  name: 'weather',
  group: 'fun',
  summary: 'Virtual weather',
  run(ctx) {
    const { weather: w, osName } = ctx.content
    ctx.out.print(`🌍 Weather in ${osName} Virtual World:`)
    ctx.out.print(`${pick(w.conditions, ctx.random)} ${pick(w.temps, ctx.random)}°C`)
    ctx.out.print('Humidity: 42% (the answer to everything)')
    ctx.out.print('Wind: 5 km/h from the direction of productivity')
    ctx.out.print(pick(w.forecasts, ctx.random), 'cyan')
    ctx.out.content(ctx.content.blocks.weatherFooter ?? [])
  },
}

const crypto: CommandSpec = {
  name: 'crypto',
  group: 'fun',
  summary: 'Fake crypto prices',
  run(ctx) {
    ctx.out.print('💰 Crypto Prices (Totally Real™):')
    ctx.out.print()
    for (const coin of ctx.content.crypto) {
      const price = ctx.random() * coin.spread + coin.min
      const change = (ctx.random() - 0.5) * 20
      ctx.out.spans([
        { text: `${coin.name} (${coin.symbol}): $${price.toFixed(2)} ` },
        { text: `${change > 0 ? '+' : ''}${change.toFixed(2)}%`, tone: change > 0 ? 'green' : 'red' },
      ])
    }
    ctx.out.print()
    ctx.out.print('Disclaimer: These prices are as real as unicorns! 🦄', 'yellow')
  },
}

const hack: CommandSpec = {
  name: 'hack',
  aliases: ['hacker'],
  group: 'fun',
  summary: 'Hack something fun',
  run(ctx) {
    ctx.out.content(ctx.content.blocks.hackStart ?? [])
    ctx.out.later(1500, ctx.content.blocks.hackLater ?? [])
  },
}

const RAINBOW: [Tone, string][] = [
  ['red', '🔴'],
  ['yellow', '🟠'],
  ['yellow', '🟡'],
  ['green', '🟢'],
  ['blue', '🔵'],
  ['magenta', '🟣'],
]

const rainbow: CommandSpec = {
  name: 'rainbow',
  group: 'fun',
  summary: 'Display rainbow colors',
  run(ctx) {
    RAINBOW.forEach(([tone, dot], i) => {
      const line: ContentLine = [tone, `${dot} Rainbow line ${i + 1}`]
      ctx.out.later(i * 200, [line])
    })
  },
}

const easterEggs: CommandSpec[] = [
  { name: 'sl', group: 'fun', summary: 'Steam locomotive', run: block('sl') },
  { name: 'rickroll', group: 'fun', summary: 'You know what this does', run: block('rickroll') },
  { name: 'ascii', group: 'fun', summary: 'Show ASCII art', run: block('ascii') },
  { name: 'logo', group: 'fun', summary: 'Display terminal logo', run: block('termuxLogo') },
  { name: 'sound', group: 'fun', summary: 'Play terminal sounds', run: block('sound') },
  // Not listed in `help`: for people who poke around.
  { name: 'about', run: block('about') },
  { name: 'projects', run: block('projects') },
  { name: 'launch', run: block('launch') },
  { name: 'love', run: block('love') },
  { name: 'pizza', run: block('pizza') },
  { name: 'beer', run: block('beer') },
  { name: 'unicorn', run: block('unicorn') },
  { name: 'meaning', aliases: ['42'], run: block('meaning') },
  { name: 'hello', aliases: ['hi'], run: block('hello') },
  { name: 'thanks', aliases: ['thank'], run: block('thanks') },
]

function runSudo(ctx: CommandContext) {
  if (ctx.args.length) ctx.out.print(`[sudo] password for ${ctx.shell.user}: ********`, 'dim')
  if (isRmRfRoot(ctx.args)) ctx.out.content(ctx.content.blocks.rmrf ?? [])
  ctx.out.content(ctx.content.blocks.sudo ?? [])
  return 1
}

const sudo: CommandSpec = { name: 'sudo', run: runSudo }

/** `please ls` → "Nice try! Running: ls", then actually runs it. */
const please: CommandSpec = {
  name: 'please',
  aliases: ['fucking'],
  run(ctx) {
    const [name, ...args] = ctx.args
    if (!name) {
      ctx.out.error('sudo: a command is required')
      return 1
    }
    ctx.out.print(`Nice try! Running: ${ctx.args.join(' ')}`, 'yellow')
    return ctx.shell.dispatch(name, args, ctx.out, ctx.stdin, ctx.tty)
  },
}

const rm: CommandSpec = {
  name: 'rm',
  run(ctx) {
    ctx.out.content((isRmRfRoot(ctx.args) ? ctx.content.blocks.rmrf : ctx.content.blocks.rm) ?? [])
    return 1
  },
}

export const funCommands: CommandSpec[] = [
  cowsay,
  fortune,
  matrix,
  coffee,
  joke,
  quote,
  motivate,
  weather,
  crypto,
  hack,
  rainbow,
  ...easterEggs,
  sudo,
  please,
  rm,
]
