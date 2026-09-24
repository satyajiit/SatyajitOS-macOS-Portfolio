import { describe, expect, it } from 'vitest'

import {
  ageInMinutes,
  allItems,
  breadcrumbs,
  findItem,
  kindLabel,
  parentOf,
  previewOf,
  resolveLocation,
  searchItems,
  sizeInBytes,
  sortItems,
} from '../fs'

describe('finder file system', () => {
  it('derives kinds from file names', () => {
    const csv = findItem('coffee-addiction-stats')!
    expect(csv.kind).toBe('spreadsheet')
    expect(kindLabel(csv)).toBe('CSV Document')
    expect(findItem('blockchain-coffee')!.kind).toBe('code')
    expect(findItem('work-life-balance')!.kind).toBe('unknown')
    expect(findItem('zyada-shop-folder')!.kind).toBe('folder')
  })

  it('lists every item once', () => {
    const ids = allItems().map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('nests folders under their closest existing parent', () => {
    const home = resolveLocation('home')!
    const names = home.items.map((i) => i.id)
    expect(names).toEqual(expect.arrayContaining(['desktop', 'documents', 'projects', 'memes', 'mosambee-magic']))
    expect(resolveLocation('projects')!.items.map((i) => i.id)).toEqual(
      expect.arrayContaining(['zyada-shop-folder', 'failed-experiments', 'future-unicorns']),
    )
  })

  it('builds Finder-style breadcrumbs with browsable segments', () => {
    const crumbs = breadcrumbs(resolveLocation('zyada-shop-folder')!)
    expect(crumbs.map((c) => c.name)).toEqual(['Macintosh HD', 'Users', 'satyajit', 'Projects', 'ZyadaShop Legacy'])
    expect(crumbs[2]!.id).toBe('home')
    expect(crumbs[1]!.id).toBeUndefined()
  })

  it('resolves parents for ⌘↑', () => {
    expect(parentOf('documents')).toBe('home')
    expect(parentOf('memes')).toBe('home')
    expect(parentOf('home')).toBeNull()
    expect(parentOf('gamex-wallpaper')).toBe('side-projects-folder')
    expect(parentOf('screenshots')).toBeNull()
  })

  it('computes smart folders and tags from every file', () => {
    const shots = resolveLocation('screenshots')!.items.map((i) => i.id)
    expect(shots).toEqual(expect.arrayContaining(['screenshot-chaos', 'debugging-meme', 'business-plan-v1']))
    const yc = resolveLocation('yc-journey')!.items.map((i) => i.id)
    expect(yc).toEqual(expect.arrayContaining(['yc-application-v47', 'yc-application']))
    const orange = resolveLocation('tag-orange')!.items.map((i) => i.id)
    expect(orange).toEqual(expect.arrayContaining(['coffee-addiction-stats', 'biryani-code-correlation']))
  })

  it('locks the folders that should not open and opens empty project folders', () => {
    expect(resolveLocation('resume-collection')!.error).toBe('permission')
    const empty = resolveLocation('gamex-wallpaper')!
    expect(empty.items).toEqual([])
    expect(empty.error).toBeUndefined()
    expect(resolveLocation('nope')).toBeNull()
  })

  it('searches names, descriptions and tags', () => {
    expect(searchItems('biryani').map((i) => i.id)).toContain('biryani-code-correlation')
    expect(searchItems('caffeine dependency').map((i) => i.id)).toContain('coffee-addiction-stats')
    expect(searchItems('celebration').map((i) => i.id)).toContain('zyada-shop-exit-story')
    expect(searchItems('   ')).toHaveLength(allItems().length)
  })

  it('sorts sizes and relative dates sensibly', () => {
    expect(sizeInBytes('2.3 MB')).toBeGreaterThan(sizeInBytes('666 KB'))
    expect(sizeInBytes(undefined)).toBe(-1)
    expect(ageInMinutes('2 hours ago')).toBeLessThan(ageInMinutes('Yesterday'))
    expect(ageInMinutes('Last week')).toBeLessThan(ageInMinutes('3 months ago'))
    expect(ageInMinutes('Never')).toBe(Number.POSITIVE_INFINITY)

    const desktop = resolveLocation('desktop')!.items
    const bySize = sortItems(desktop, 'size', -1)
    expect(bySize[0]!.id).toBe('mosambee-innovations')
  })

  it('always has something to preview', () => {
    for (const item of allItems()) expect(previewOf(item).length).toBeGreaterThan(0)
    const code = previewOf(findItem('ai-girlfriend')!)[0]!
    expect(code.type).toBe('text')
  })
})
