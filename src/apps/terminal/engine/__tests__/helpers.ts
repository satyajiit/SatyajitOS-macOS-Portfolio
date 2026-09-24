import { terminalContent } from '@/content/terminal'

import { lineText, Shell, type Platform, type RunResult } from '..'

export const NOW = new Date(2026, 8, 24, 17, 5, 12)

export function makeShell(platform: Platform = 'desktop', columns = 80) {
  // random() → 0 picks the first entry of every list, so output is stable.
  return new Shell({ content: terminalContent, platform, random: () => 0, now: () => NOW, columns })
}

export const text = (result: RunResult) => result.lines.map(lineText)
export const joined = (result: RunResult) => text(result).join('\n')
