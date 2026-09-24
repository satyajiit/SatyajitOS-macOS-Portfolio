import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useFinderStore } from '../store'

describe('finder store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('starts on the Desktop with nothing to go back to', () => {
    const finder = useFinderStore()
    expect(finder.currentId).toBe('desktop')
    expect(finder.location.name).toBe('Desktop')
    expect(finder.canGoBack).toBe(false)
    expect(finder.canGoForward).toBe(false)
  })

  it('records history and walks it back and forward', () => {
    const finder = useFinderStore()
    finder.open('documents')
    finder.open('downloads')
    expect(finder.history).toEqual(['desktop', 'documents', 'downloads'])

    finder.back()
    expect(finder.currentId).toBe('documents')
    expect(finder.canGoForward).toBe(true)

    finder.forward()
    expect(finder.currentId).toBe('downloads')
    expect(finder.canGoForward).toBe(false)
  })

  it('drops the forward history when you branch off', () => {
    const finder = useFinderStore()
    finder.open('documents')
    finder.open('downloads')
    finder.back()
    finder.open('memes')
    expect(finder.history).toEqual(['desktop', 'documents', 'memes'])
    expect(finder.canGoForward).toBe(false)
  })

  it('ignores unknown locations and repeated opens', () => {
    const finder = useFinderStore()
    expect(finder.open('does-not-exist')).toBe(false)
    expect(finder.open('desktop')).toBe(true)
    expect(finder.history).toEqual(['desktop'])
  })

  it('opens the enclosing folder and selects where it came from', () => {
    const finder = useFinderStore()
    finder.open('zyada-shop-folder')
    expect(finder.openEnclosing()).toBe(true)
    expect(finder.currentId).toBe('projects')
    expect(finder.selectedId).toBe('zyada-shop-folder')
  })

  it('searches the whole disk by default and only the folder when scoped', () => {
    const finder = useFinderStore()
    finder.setQuery('coffee')
    const everywhere = finder.items.map((i) => i.id)
    expect(everywhere).toContain('coffee-addiction-stats')
    expect(everywhere).toContain('blockchain-coffee')

    finder.scope = 'here'
    const here = finder.items.map((i) => i.id)
    expect(here).toContain('coffee-addiction-stats')
    expect(here).not.toContain('blockchain-coffee')
  })

  it('clears the search when navigating', () => {
    const finder = useFinderStore()
    finder.setQuery('meme')
    finder.open('documents')
    expect(finder.query).toBe('')
  })

  it('moves the selection within bounds and type-selects by prefix', () => {
    const finder = useFinderStore()
    finder.moveSelection(1)
    const first = finder.items[0]!.id
    expect(finder.selectedId).toBe(first)
    finder.moveSelection(-5)
    expect(finder.selectedId).toBe(first)
    finder.moveSelection(999)
    expect(finder.selectedId).toBe(finder.items.at(-1)!.id)

    expect(finder.selectByPrefix('work')).toBe(true)
    expect(finder.selectedId).toBe('work-life-balance')
  })

  it('flips sort direction on the same column', () => {
    const finder = useFinderStore()
    finder.setSort('size')
    expect(finder.sortKey).toBe('size')
    expect(finder.sortDir).toBe(1)
    finder.setSort('size')
    expect(finder.sortDir).toBe(-1)
  })

  it('toggles session tags on an item', () => {
    const finder = useFinderStore()
    finder.toggleTag('meeting-notes', 'orange')
    expect(finder.addedTags['meeting-notes']).toEqual(['productivity'])
    finder.toggleTag('meeting-notes', 'orange')
    expect(finder.addedTags['meeting-notes']).toEqual([])
  })
})
