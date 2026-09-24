import type { CommandSpec } from '../command'

import { devCommands } from './dev'
import { fileCommands } from './files'
import { funCommands } from './fun'
import { systemCommands } from './system'
import { textCommands } from './text'
import { HELP_ORDER, utilityCommands } from './utils'

const help: CommandSpec = {
  name: 'help',
  group: 'utils',
  summary: 'Show this help',
  run(ctx) {
    const { content, out } = ctx
    // Column wide enough for the longest usage, so descriptions always line up.
    const width = Math.max(19, ...COMMANDS.filter((c) => c.group).map((c) => (c.usage ?? c.name).length + 2))
    out.content([['green', content.helpHeader]])
    for (const group of HELP_ORDER) {
      out.print()
      out.print(content.helpGroups[group], 'fg', true)
      for (const cmd of COMMANDS) {
        if (cmd.group !== group) continue
        out.spans([{ text: `   ${(cmd.usage ?? cmd.name).padEnd(width)}`, tone: 'cyan' }, { text: cmd.summary ?? '' }])
      }
    }
    out.print()
    out.content(content.helpFooter)
  },
}

/** Every command, in `help` order. */
export const COMMANDS: CommandSpec[] = [
  ...fileCommands,
  ...systemCommands,
  ...devCommands,
  ...funCommands,
  ...utilityCommands,
  ...textCommands,
  help,
]

/** Shell-level aliases (from .zshrc), expanded before lookup. */
export const ALIASES: Record<string, string[]> = {
  ll: ['ls', '-la'],
  la: ['ls', '-la'],
  '..': ['cd', '..'],
}

const registry = new Map<string, CommandSpec>()
for (const cmd of COMMANDS) {
  registry.set(cmd.name, cmd)
  for (const alias of cmd.aliases ?? []) registry.set(alias, cmd)
}

export function findCommand(name: string): CommandSpec | undefined {
  return registry.get(name.toLowerCase())
}

/** Every name the user can type first: commands, their aliases, shell aliases. */
export const commandNames = (): string[] => [...new Set([...registry.keys(), ...Object.keys(ALIASES)])].sort()
