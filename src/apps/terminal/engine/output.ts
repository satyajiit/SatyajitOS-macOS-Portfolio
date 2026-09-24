import type { ContentLine, Effect, OutputLine, Span, Tone } from './types'

/** Fill `{key}` placeholders in content copy. Unknown keys are left as-is. */
export function fill(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => vars[key] ?? match)
}

export function textLine(text: string, tone?: Tone, bold?: boolean): OutputLine {
  return { kind: 'output', spans: [{ text, tone, bold }] }
}

export function contentLine(line: ContentLine, vars: Record<string, string> = {}): OutputLine {
  return typeof line === 'string'
    ? textLine(fill(line, vars))
    : textLine(fill(line[1], vars), line[0])
}

/** The plain text of a line, used when output is piped into another command. */
export function lineText(line: OutputLine): string {
  return line.spans.map((span) => span.text).join('')
}

/** Collects what a command prints plus the effects it asks the UI to perform. */
export class Output {
  readonly lines: OutputLine[] = []
  readonly effects: Effect[] = []

  constructor(private readonly vars: Record<string, string> = {}) {}

  print(text = '', tone?: Tone, bold?: boolean) {
    for (const part of text.split('\n')) this.lines.push(textLine(part, tone, bold))
  }

  error(text: string) {
    this.print(text, 'red')
  }

  spans(spans: Span[]) {
    this.lines.push({ kind: 'output', spans })
  }

  content(lines: readonly ContentLine[], extra: Record<string, string> = {}) {
    const vars = { ...this.vars, ...extra }
    for (const line of lines) this.lines.push(contentLine(line, vars))
  }

  later(delay: number, lines: readonly ContentLine[]) {
    this.effects.push({ type: 'later', delay, lines: lines.map((l) => contentLine(l, this.vars)) })
  }

  effect(effect: Effect) {
    this.effects.push(effect)
  }
}
