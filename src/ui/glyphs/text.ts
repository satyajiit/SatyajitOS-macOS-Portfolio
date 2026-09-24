import { isGlyphName, type GlyphName } from './registry'

export type GlyphToken = { type: 'text'; value: string } | { type: 'glyph'; name: GlyphName }

/** `:name:` where name is a registered glyph. Unknown names stay as text, so "12:30:45" is safe. */
const PATTERN = /:([a-z][a-z0-9-]*):/g

export function tokenize(text: string): GlyphToken[] {
  const tokens: GlyphToken[] = []
  let last = 0
  for (const match of text.matchAll(PATTERN)) {
    const name = match[1]!
    if (!isGlyphName(name)) continue
    if (match.index > last) tokens.push({ type: 'text', value: text.slice(last, match.index) })
    tokens.push({ type: 'glyph', name })
    last = match.index + match[0].length
  }
  if (last < text.length) tokens.push({ type: 'text', value: text.slice(last) })
  return tokens
}

/** Plain-text version for places that can't render icons (titles, inputs, aria-labels). */
export function stripGlyphs(text: string): string {
  return text
    .replace(PATTERN, (whole, name: string) => (isGlyphName(name) ? '' : whole))
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/^[ \t]+|[ \t]+$/gm, '')
}

export function hasGlyphs(text: string): boolean {
  return tokenize(text).some((t) => t.type === 'glyph')
}
