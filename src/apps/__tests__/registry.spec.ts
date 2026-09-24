import { describe, expect, it } from 'vitest'

import { appIcons } from '@/ui/app-icons'

import { apps, getApp, isAppId } from '../registry'

describe('app registry', () => {
  it('has unique ids and a known icon for every app', () => {
    const ids = apps.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const app of apps) expect(appIcons[app.icon]).toBeDefined()
  })

  it('gives every desktop app a sane window spec', () => {
    for (const app of apps.filter((a) => a.desktop)) {
      const spec = app.desktop!
      expect(spec.width).toBeGreaterThanOrEqual(spec.minWidth)
      expect(spec.height).toBeGreaterThanOrEqual(spec.minHeight)
    }
  })

  it('pins at most four apps to the iPhone dock', () => {
    expect(apps.filter((a) => a.mobileDock).length).toBeLessThanOrEqual(4)
  })

  it('looks apps up by id', () => {
    expect(getApp('terminal')?.name).toBe('Terminal')
    expect(getApp('nope')).toBeUndefined()
    expect(isAppId('finder')).toBe(true)
    expect(isAppId('termux')).toBe(false)
  })
})
