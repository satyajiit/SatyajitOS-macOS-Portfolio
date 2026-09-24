import type { CommandSpec } from '../command'

const git: CommandSpec = {
  name: 'git',
  group: 'dev',
  usage: 'git <cmd>',
  summary: 'Git version control',
  run(ctx) {
    const { blocks } = ctx.content
    const [sub, ...rest] = ctx.args
    const now = ctx.now()
    const vars = {
      today: now.toDateString(),
      yesterday: new Date(now.getTime() - 86400000).toDateString(),
    }
    switch (sub) {
      case undefined:
        ctx.out.content(blocks.gitUsage ?? [])
        return 1
      case 'status':
        ctx.out.content(blocks.gitStatus ?? [])
        return 0
      case 'log':
        ctx.out.content(blocks.gitLog ?? [], vars)
        return 0
      case 'add':
        ctx.out.print(
          rest[0] === '.' ? ':done: All changes staged for commit!' : `:done: Added ${rest.join(' ')} to staging area`,
          'green',
        )
        return 0
      case 'commit':
        ctx.out.content(blocks.gitCommit ?? [])
        return 0
      case 'push':
        ctx.out.content(blocks.gitPush ?? [])
        return 0
      default:
        ctx.out.error(`git: '${sub}' is not a git command. See 'git --help'.`)
        return 1
    }
  },
}

const npm: CommandSpec = {
  name: 'npm',
  group: 'dev',
  usage: 'npm <cmd>',
  summary: 'Node package manager',
  run(ctx) {
    const { blocks } = ctx.content
    const [sub, script] = ctx.args
    switch (sub) {
      case undefined:
        ctx.out.content(blocks.npmUsage ?? [])
        return 1
      case 'install':
      case 'i':
        ctx.out.content(blocks.npmInstall ?? [])
        return 0
      case 'run':
        if (script === 'dev') ctx.out.content(blocks.npmDev ?? [])
        else ctx.out.print(`Running script: ${script ?? ''}`)
        return 0
      case 'test':
        ctx.out.content(blocks.npmTest ?? [])
        return 0
      default:
        ctx.out.error(`Unknown command: "${sub}"`)
        return 1
    }
  },
}

const node: CommandSpec = {
  name: 'node',
  group: 'dev',
  usage: 'node [file]',
  summary: 'Run Node.js',
  run(ctx) {
    const [first] = ctx.args
    if (!first) ctx.out.content(ctx.content.blocks.nodeRepl ?? [])
    else if (first === '--version' || first === '-v') ctx.out.print('v18.17.0')
    else {
      ctx.out.print(`Executing: node ${ctx.args.join(' ')}`)
      ctx.out.print(':done: Script executed successfully!', 'green')
    }
  },
}

const python: CommandSpec = {
  name: 'python',
  aliases: ['python3'],
  group: 'dev',
  usage: 'python [file]',
  summary: 'Run Python',
  run(ctx) {
    const [first] = ctx.args
    if (!first) ctx.out.content(ctx.content.blocks.pythonRepl ?? [])
    else if (first === '--version' || first === '-V') ctx.out.print('Python 3.11.4')
    else {
      ctx.out.print(`Executing: python ${ctx.args.join(' ')}`)
      ctx.out.print(':done: Python script executed successfully!', 'green')
    }
  },
}

const vim: CommandSpec = {
  name: 'vim',
  aliases: ['vi'],
  group: 'dev',
  usage: 'vim [file]',
  summary: 'Vim editor (preview)',
  run: (ctx) => ctx.out.content(ctx.content.blocks.vim ?? []),
}

const nano: CommandSpec = {
  name: 'nano',
  group: 'dev',
  usage: 'nano [file]',
  summary: 'Nano editor (preview)',
  run: (ctx) => ctx.out.content(ctx.content.blocks.nano ?? [], { file: ctx.args[0] ?? 'untitled.txt' }),
}

export const devCommands: CommandSpec[] = [git, npm, node, python, vim, nano]
