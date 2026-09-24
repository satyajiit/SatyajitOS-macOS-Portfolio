import { describe, expect, it } from 'vitest'

import { parse, tokenize } from '../parse'

const env = { home: '/Users/satyajit', vars: { USER: 'satyajit', HOME: '/Users/satyajit' } }

describe('tokenize', () => {
  it('splits words and keeps quoted spaces together', () => {
    expect(tokenize(`echo "hello world" 'single quoted'`, env)).toEqual([
      { type: 'word', value: 'echo' },
      { type: 'word', value: 'hello world' },
      { type: 'word', value: 'single quoted' },
    ])
  })

  it('expands ~ and $VARS, but not inside single quotes', () => {
    const tokens = tokenize(`echo ~/Desktop $USER "\${HOME}" '$USER'`, env)
    expect(Array.isArray(tokens) && tokens.map((t) => t.value)).toEqual([
      'echo',
      '/Users/satyajit/Desktop',
      'satyajit',
      '/Users/satyajit',
      '$USER',
    ])
  })

  it('handles backslash escapes', () => {
    const tokens = tokenize('cat my\\ file', env)
    expect(Array.isArray(tokens) && tokens.map((t) => t.value)).toEqual(['cat', 'my file'])
  })

  it('reports unmatched quotes the way zsh does', () => {
    expect(tokenize('echo "oops', env)).toEqual({ error: 'zsh: unmatched "' })
  })
})

describe('parse', () => {
  it('builds pipelines and && / ; sequences', () => {
    const result = parse('ls | grep D && pwd ; whoami', env)
    expect(result).toEqual({
      ok: true,
      steps: [
        {
          commands: [
            { name: 'ls', args: [] },
            { name: 'grep', args: ['D'] },
          ],
          next: '&&',
        },
        { commands: [{ name: 'pwd', args: [] }], next: ';' },
        { commands: [{ name: 'whoami', args: [] }], next: null },
      ],
    })
  })

  it('rejects a dangling pipe', () => {
    expect(parse('ls |', env)).toEqual({ ok: false, error: "zsh: parse error near `|'" })
  })
})
