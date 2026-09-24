/**
 * A small zsh-flavoured parser: words, single/double quotes, backslash
 * escapes, `~` and `$VAR` expansion, and the `|`, `&&`, `;` operators.
 */

export type Operator = '|' | '&&' | ';'

export interface SimpleCommand {
  name: string
  args: string[]
}

export interface PipelineStep {
  /** Commands joined by `|`. */
  commands: SimpleCommand[]
  /** How this pipeline connects to the next one. */
  next: '&&' | ';' | null
}

export type ParseResult = { ok: true; steps: PipelineStep[] } | { ok: false; error: string }

type Token = { type: 'word'; value: string } | { type: 'op'; value: Operator }

export interface ExpandEnv {
  home: string
  vars: Record<string, string>
}

export function tokenize(input: string, env: ExpandEnv): Token[] | { error: string } {
  const tokens: Token[] = []
  let word = ''
  let inWord = false
  let i = 0

  const push = () => {
    if (inWord) tokens.push({ type: 'word', value: word })
    word = ''
    inWord = false
  }
  const expandVar = (from: number): number => {
    const match = /^\$(\{(\w+)\}|(\w+))/.exec(input.slice(from))
    if (!match) {
      word += '$'
      return from + 1
    }
    word += env.vars[match[2] ?? match[3] ?? ''] ?? ''
    return from + match[0].length
  }

  while (i < input.length) {
    const ch = input[i]!
    if (ch === ' ' || ch === '\t') {
      push()
      i++
    } else if (ch === '|' || ch === ';') {
      push()
      tokens.push({ type: 'op', value: ch })
      i++
    } else if (ch === '&' && input[i + 1] === '&') {
      push()
      tokens.push({ type: 'op', value: '&&' })
      i += 2
    } else if (ch === "'") {
      const end = input.indexOf("'", i + 1)
      if (end === -1) return { error: "zsh: unmatched '" }
      word += input.slice(i + 1, end)
      inWord = true
      i = end + 1
    } else if (ch === '"') {
      inWord = true
      i++
      while (i < input.length && input[i] !== '"') {
        if (input[i] === '\\' && i + 1 < input.length) {
          word += input[i + 1]
          i += 2
        } else if (input[i] === '$') {
          i = expandVar(i)
        } else {
          word += input[i]
          i++
        }
      }
      if (i >= input.length) return { error: 'zsh: unmatched "' }
      i++
    } else if (ch === '\\' && i + 1 < input.length) {
      word += input[i + 1]
      inWord = true
      i += 2
    } else if (ch === '$') {
      inWord = true
      i = expandVar(i)
    } else if (ch === '~' && !inWord && (input[i + 1] === undefined || /[\s/;|&]/.test(input[i + 1]!))) {
      word += env.home
      inWord = true
      i++
    } else {
      word += ch
      inWord = true
      i++
    }
  }
  push()
  return tokens
}

export function parse(input: string, env: ExpandEnv): ParseResult {
  const tokens = tokenize(input, env)
  if (!Array.isArray(tokens)) return { ok: false, error: tokens.error }

  const steps: PipelineStep[] = []
  let commands: SimpleCommand[] = []
  let words: string[] = []

  const endCommand = (op: string): string | null => {
    if (!words.length) return `zsh: parse error near \`${op}'`
    commands.push({ name: words[0]!, args: words.slice(1) })
    words = []
    return null
  }

  for (const token of tokens) {
    if (token.type === 'word') {
      words.push(token.value)
      continue
    }
    if (token.value === ';' && !words.length && !commands.length) continue
    const error = endCommand(token.value)
    if (error) return { ok: false, error }
    if (token.value !== '|') {
      steps.push({ commands, next: token.value })
      commands = []
    }
  }

  if (words.length) commands.push({ name: words[0]!, args: words.slice(1) })
  else if (commands.length) return { ok: false, error: "zsh: parse error near `|'" }
  if (commands.length) steps.push({ commands, next: null })
  return { ok: true, steps }
}
