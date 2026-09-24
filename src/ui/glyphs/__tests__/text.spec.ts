import { describe, expect, it } from 'vitest'

import { hasGlyphs, stripGlyphs, tokenize } from '../text'

describe('glyph text', () => {
  it('splits known codes into glyph tokens and keeps the rest as text', () => {
    expect(tokenize('Ship it :rocket: now')).toEqual([
      { type: 'text', value: 'Ship it ' },
      { type: 'glyph', name: 'rocket' },
      { type: 'text', value: ' now' },
    ])
  })

  it('leaves unknown codes and clock times alone', () => {
    expect(tokenize('Meet at 12:30:45 :not-a-glyph:')).toEqual([
      { type: 'text', value: 'Meet at 12:30:45 :not-a-glyph:' },
    ])
  })

  it('handles adjacent glyphs and glyph-only strings', () => {
    expect(tokenize(':coffee::sparkles:').map((t) => t.type)).toEqual(['glyph', 'glyph'])
  })

  it('strips glyphs for plain-text contexts without leaving double spaces', () => {
    expect(stripGlyphs(':briefcase: Interested in Your Work!')).toBe('Interested in Your Work!')
    expect(stripGlyphs('Brewing :coffee: now')).toBe('Brewing now')
    expect(stripGlyphs('line one :zap:\n:rocket: line two')).toBe('line one\nline two')
  })

  it('reports whether a string has glyphs', () => {
    expect(hasGlyphs('plain')).toBe(false)
    expect(hasGlyphs('with :star:')).toBe(true)
  })
})
