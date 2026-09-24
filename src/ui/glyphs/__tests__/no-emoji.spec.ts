import { describe, expect, it } from 'vitest'

import { glyphs } from '../registry'
import { tokenize } from '../text'

/**
 * Guard rail: the UI uses Lucide glyphs, never emoji. Write `:rocket:` in copy
 * instead. Keyboard symbols (⌘ ⌃ ⌥ ⇧) are text, not emoji, so they are fine.
 */
const sources = import.meta.glob<string>(['/src/**/*.{ts,vue}', '!/src/**/__tests__/**'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}]/u

describe('no emoji in source', () => {
  it('finds sources to check', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(50)
  })

  for (const [path, text] of Object.entries(sources)) {
    it(`${path} uses glyph codes, not emoji`, () => {
      const offenders = [...text.matchAll(new RegExp(EMOJI, 'gu'))].map((m) => m[0])
      expect(offenders).toEqual([])
    })
  }

  it('every glyph code used in content is registered', () => {
    const unknown = new Set<string>()
    for (const [path, text] of Object.entries(sources)) {
      if (!path.startsWith('/src/content/')) continue
      for (const m of text.matchAll(/:([a-z][a-z0-9-]*):/g)) {
        const name = m[1]!
        // Skip things like "12:30:45" and URLs; only flag word-like codes that look intended.
        if (/^\d/.test(name) || name in glyphs) continue
        if (tokenize(m[0])[0]?.type === 'text' && /^[a-z]+(-[a-z]+)*$/.test(name)) unknown.add(name)
      }
    }
    expect([...unknown]).toEqual([])
  })
})
