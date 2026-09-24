import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { deliveries, owner, seedMessages } from '@/content/mail'
import { useNotificationsStore } from '@/stores/notifications'

import { fullDate, initials, listDate } from '../format'
import { isEmail, previewOf, useMailStore } from '../store'

describe('mail store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with the seeded messages and counts inbox unread only', () => {
    const mail = useMailStore()
    expect(mail.messages).toHaveLength(seedMessages.length)
    const expected = seedMessages.filter((m) => m.mailbox === 'inbox' && !m.read).length
    expect(mail.unreadCount).toBe(expected)
    // Junk mail is unread too, but never counts towards the badge.
    expect(mail.messages.some((m) => m.mailbox === 'junk' && !m.read)).toBe(true)
  })

  it('keeps ids unique', () => {
    const ids = [...seedMessages.map((m) => m.id), ...deliveries.map((d) => d.message.id)]
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('lists each mailbox newest first and never mixes sent mail into the inbox', () => {
    const mail = useMailStore()
    expect(mail.visible.every((m) => m.mailbox === 'inbox')).toBe(true)
    const times = mail.visible.map((m) => m.receivedAt)
    expect(times).toEqual([...times].sort((a, b) => b - a))

    mail.selectMailbox('sent')
    expect(mail.visible.length).toBeGreaterThan(0)
    expect(mail.visible.every((m) => m.from.address === owner.address)).toBe(true)
  })

  it('treats Flagged as a smart mailbox that skips the Trash', () => {
    const mail = useMailStore()
    mail.selectMailbox('flagged')
    const flagged = mail.visible.map((m) => m.id)
    expect(flagged.length).toBe(mail.counts.flagged)
    mail.trash(flagged[0]!)
    expect(mail.visible.map((m) => m.id)).not.toContain(flagged[0])
  })

  it('marks a message read when it is selected', () => {
    const mail = useMailStore()
    const unread = mail.visible.find((m) => !m.read)!
    const before = mail.unreadCount
    mail.select(unread.id)
    expect(mail.selected?.id).toBe(unread.id)
    expect(mail.unreadCount).toBe(before - 1)
  })

  it('moves to Trash, restores to where it came from, then deletes for good', () => {
    const mail = useMailStore()
    const id = mail.visible[0]!.id
    expect(mail.trash(id)).toBe('trashed')
    expect(mail.visible.map((m) => m.id)).not.toContain(id)

    mail.selectMailbox('trash')
    expect(mail.visible.map((m) => m.id)).toContain(id)
    mail.restore(id)
    mail.selectMailbox('inbox')
    expect(mail.visible.map((m) => m.id)).toContain(id)

    mail.trash(id)
    expect(mail.trash(id)).toBe('deleted')
    expect(mail.messages.find((m) => m.id === id)).toBeUndefined()
  })

  it('junks and un-junks', () => {
    const mail = useMailStore()
    const id = mail.visible[0]!.id
    mail.moveToJunk(id)
    expect(mail.messages.find((m) => m.id === id)?.mailbox).toBe('junk')
    mail.notJunk(id)
    expect(mail.messages.find((m) => m.id === id)?.mailbox).toBe('inbox')
  })

  it('files sent mail from the owner into Sent', () => {
    const mail = useMailStore()
    const sentBefore = mail.messages.filter((m) => m.mailbox === 'sent').length
    const message = mail.send({ to: ' hi@example.com ', subject: 'Hello', body: 'Coffee?' })
    expect(message.mailbox).toBe('sent')
    expect(message.from).toEqual(owner)
    expect(message.to.address).toBe('hi@example.com')
    expect(mail.messages.filter((m) => m.mailbox === 'sent')).toHaveLength(sentBefore + 1)
  })

  it('builds a reply draft to the sender, without stacking "Re:"', () => {
    const mail = useMailStore()
    const incoming = mail.visible[0]!
    const draft = mail.replyDraft(incoming.id)
    expect(draft.to).toBe(incoming.from.address)
    expect(draft.subject).toBe(`Re: ${incoming.subject}`)
    expect(draft.body).toContain('--- Original Message ---')

    const sent = mail.send(draft)
    expect(mail.replyDraft(sent.id).subject).toBe(draft.subject)
  })

  it('delivers new mail once, with one banner and the rest filed quietly', () => {
    vi.useFakeTimers()
    const mail = useMailStore()
    const notifications = useNotificationsStore()
    const before = mail.messages.length

    const notify = vi.spyOn(notifications, 'notify')

    mail.startDeliveries()
    mail.startDeliveries()
    vi.advanceTimersByTime(deliveries[0]!.afterMs)
    expect(notifications.banners).toHaveLength(1)

    vi.advanceTimersByTime(60_000)
    // Later arrivals are filed silently, so only the first ever shows a banner.
    expect(notify.mock.calls.map(([input]) => !!input.silent)).toEqual(
      deliveries.map((_, i) => i > 0),
    )
    expect(mail.messages).toHaveLength(before + deliveries.length)
    expect(notifications.history).toHaveLength(deliveries.length)
  })

  it('delivers a pending message early when it is deep-linked', () => {
    const mail = useMailStore()
    expect(mail.open('dynamic-5')).toBe(true)
    expect(mail.selected?.id).toBe('dynamic-5')
    expect(mail.open('does-not-exist')).toBe(false)
  })

  it('opens a message in whichever mailbox holds it', () => {
    const mail = useMailStore()
    mail.open('spam-1')
    expect(mail.mailbox).toBe('junk')
    expect(mail.selected?.id).toBe('spam-1')
  })
})

describe('mail helpers', () => {
  it('validates addresses', () => {
    expect(isEmail('a@b.co')).toBe(true)
    expect(isEmail('Y Combinator')).toBe(false)
  })

  it('makes a single-line preview', () => {
    expect(previewOf('Hi\n\nthere')).toBe('Hi there')
    expect(previewOf('x'.repeat(200)).endsWith('…')).toBe(true)
  })

  it('formats list dates like Mail', () => {
    const now = new Date(2026, 8, 24, 17, 0).getTime()
    expect(listDate(new Date(2026, 8, 24, 9, 5).getTime(), now, 'en-GB')).toMatch(/09:05|9:05/)
    expect(listDate(new Date(2026, 8, 23, 22, 0).getTime(), now, 'en-GB')).toBe('Yesterday')
    expect(listDate(new Date(2026, 8, 20, 12, 0).getTime(), now, 'en-GB')).toBe('Sunday')
    expect(listDate(new Date(2026, 7, 1, 12, 0).getTime(), now, 'en-GB')).toBe('01/08/26')
    expect(fullDate(new Date(2026, 8, 24, 17, 6).getTime(), 'en-GB')).toBe(
      '24 September 2026 at 17:06',
    )
  })

  it('makes monograms from names with emoji and punctuation', () => {
    expect(initials('Y Combinator')).toBe('YC')
    expect(initials('Prince Definitely-Not-A-Scammer')).toBe('PD')
    expect(initials('🤖 bot')).toBe('B')
  })
})
