import { describe, expect, it } from 'vitest'

import { displayPath, normalize, resolvePath } from '../fs'

const home = '/Users/satyajit'

describe('paths', () => {
  it('normalizes . and .. and never climbs above /', () => {
    expect(normalize('/Users/./satyajit/../satyajit//Desktop/')).toBe('/Users/satyajit/Desktop')
    expect(normalize('/../../etc')).toBe('/etc')
  })

  it('resolves relative, absolute and ~ paths', () => {
    expect(resolvePath('Desktop', home, home)).toBe('/Users/satyajit/Desktop')
    expect(resolvePath('..', home, home)).toBe('/Users')
    expect(resolvePath('/etc/hosts', home, home)).toBe('/etc/hosts')
    expect(resolvePath('~/Projects', '/tmp', home)).toBe('/Users/satyajit/Projects')
    expect(resolvePath('~', '/tmp', home)).toBe(home)
  })

  it('shows home as ~ like zsh', () => {
    expect(displayPath(home, home)).toBe('~')
    expect(displayPath(`${home}/Projects`, home)).toBe('~/Projects')
    expect(displayPath('/etc', home)).toBe('/etc')
  })
})
