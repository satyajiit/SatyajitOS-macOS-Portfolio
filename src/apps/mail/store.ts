import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import {
  deliveries,
  owner,
  seedMessages,
  type MailboxId,
  type MailSeed,
  type Sender,
} from '@/content/mail'
import { useNotificationsStore } from '@/stores/notifications'

/** A real mailbox, or the Flagged smart mailbox (flagged mail outside the Trash). */
export type MailboxView = MailboxId | 'flagged'

export interface MailMessage {
  id: string
  from: Sender
  to: Sender
  subject: string
  body: string
  preview: string
  mailbox: MailboxId
  /** Where a trashed or junked message goes back to on restore. */
  restoreTo: MailboxId | null
  read: boolean
  flagged: boolean
  tag: string
  receivedAt: number
}

export interface Draft {
  to: string
  subject: string
  body: string
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const isEmail = (value: string) => EMAIL.test(value.trim())

/** First ~140 characters of the body on one line, for list rows. */
export function previewOf(body: string): string {
  const flat = body.replace(/\s+/g, ' ').trim()
  return flat.length > 140 ? `${flat.slice(0, 140).trimEnd()}…` : flat
}

function toMessage(seed: Omit<MailSeed, 'ageMinutes'>, receivedAt: number): MailMessage {
  return {
    id: seed.id,
    from: seed.from,
    to: seed.to ?? owner,
    subject: seed.subject,
    body: seed.body,
    preview: previewOf(seed.body),
    mailbox: seed.mailbox,
    restoreTo: null,
    read: seed.read,
    flagged: !!seed.flagged,
    tag: seed.tag,
    receivedAt,
  }
}

function belongsTo(message: MailMessage, view: MailboxView): boolean {
  if (view === 'flagged') return message.flagged && message.mailbox !== 'trash'
  return message.mailbox === view
}

/**
 * Mail state. Public contract used outside the app: `unreadCount` (Dock and
 * home-screen badge). Everything else is internal to src/apps/mail.
 */
export const useMailStore = defineStore('mail', () => {
  const loadedAt = Date.now()
  const messages = ref<MailMessage[]>(
    seedMessages.map((seed) => toMessage(seed, loadedAt - seed.ageMinutes * 60_000)),
  )
  const mailbox = ref<MailboxView>('inbox')
  const selectedId = ref<string | null>(null)
  const query = ref('')

  const pending = new Map(deliveries.map((d) => [d.message.id, d]))
  const timers: ReturnType<typeof setTimeout>[] = []
  let deliveriesStarted = false
  let bannersShown = 0

  const unreadCount = computed(
    () => messages.value.filter((m) => m.mailbox === 'inbox' && !m.read).length,
  )

  /** Sidebar badges: unread for real mailboxes, total for Flagged (as Mail does). */
  const counts = computed<Record<MailboxView, number>>(() => {
    const unread = (box: MailboxId) =>
      messages.value.filter((m) => m.mailbox === box && !m.read).length
    return {
      inbox: unreadCount.value,
      flagged: messages.value.filter((m) => belongsTo(m, 'flagged')).length,
      sent: 0,
      junk: unread('junk'),
      trash: 0,
    }
  })

  const inView = computed(() => messages.value.filter((m) => belongsTo(m, mailbox.value)))

  /** The current mailbox, filtered by the search query, newest first. */
  const visible = computed(() => {
    const q = query.value.trim().toLowerCase()
    const list = q
      ? inView.value.filter((m) =>
          [m.subject, m.from.name, m.from.address, m.to.name, m.body].some((field) =>
            field.toLowerCase().includes(q),
          ),
        )
      : inView.value
    return [...list].sort((a, b) => b.receivedAt - a.receivedAt)
  })

  const selected = computed(() => messages.value.find((m) => m.id === selectedId.value) ?? null)

  const find = (id: string) => messages.value.find((m) => m.id === id)

  function selectMailbox(view: MailboxView) {
    mailbox.value = view
    selectedId.value = null
  }

  function select(id: string | null) {
    selectedId.value = id
    const message = id ? find(id) : undefined
    if (message) message.read = true
  }

  /** The row after `id` in the visible list (or before it, at the end). */
  function neighbourOf(id: string): string | null {
    const list = visible.value
    const i = list.findIndex((m) => m.id === id)
    if (i === -1) return null
    return list[i + 1]?.id ?? list[i - 1]?.id ?? null
  }

  function toggleFlag(id: string) {
    const message = find(id)
    if (message) message.flagged = !message.flagged
  }

  function setRead(id: string, read: boolean) {
    const message = find(id)
    if (message) message.read = read
  }

  function moveToJunk(id: string) {
    const message = find(id)
    if (!message || message.mailbox === 'junk') return
    message.restoreTo = message.mailbox
    message.mailbox = 'junk'
    message.read = true
  }

  function notJunk(id: string) {
    const message = find(id)
    if (!message || message.mailbox !== 'junk') return
    message.mailbox =
      message.restoreTo && message.restoreTo !== 'junk' ? message.restoreTo : 'inbox'
    message.restoreTo = null
  }

  /** Moves to Trash; deleting from the Trash removes the message for good. */
  function trash(id: string): 'trashed' | 'deleted' | null {
    const message = find(id)
    if (!message) return null
    if (selectedId.value === id) selectedId.value = null
    if (message.mailbox === 'trash') {
      messages.value = messages.value.filter((m) => m.id !== id)
      return 'deleted'
    }
    message.restoreTo = message.mailbox
    message.mailbox = 'trash'
    return 'trashed'
  }

  function restore(id: string) {
    const message = find(id)
    if (!message || (message.mailbox !== 'trash' && message.mailbox !== 'junk')) return
    message.mailbox =
      message.restoreTo && message.restoreTo !== message.mailbox ? message.restoreTo : 'inbox'
    message.restoreTo = null
  }

  function replyDraft(id: string): Draft {
    const message = find(id)
    if (!message) return { to: '', subject: '', body: '' }
    const outgoing = message.mailbox === 'sent'
    const subject = /^re:/i.test(message.subject) ? message.subject : `Re: ${message.subject}`
    return {
      to: outgoing ? message.to.address : message.from.address,
      subject,
      body: `\n\n--- Original Message ---\nFrom: ${message.from.name} <${message.from.address}>\nSubject: ${message.subject}\n\n${message.body}`,
    }
  }

  /** Files the draft in Sent. Nothing leaves the browser. */
  function send(draft: Draft): MailMessage {
    const address = draft.to.trim()
    const message = toMessage(
      {
        id: `sent-${Date.now().toString(36)}`,
        from: owner,
        to: { name: address, address },
        subject: draft.subject.trim() || '(No Subject)',
        body: draft.body,
        mailbox: 'sent',
        read: true,
        tag: 'Sent',
      },
      Date.now(),
    )
    messages.value.unshift(message)
    return message
  }

  function deliver(id: string): MailMessage | null {
    const delivery = pending.get(id)
    if (!delivery) return null
    pending.delete(id)
    const message = toMessage(delivery.message, Date.now())
    messages.value.unshift(message)
    return message
  }

  /** True if the id is (or can become, by delivering early) a real message. */
  function ensure(id: string): boolean {
    return !!find(id) || !!deliver(id)
  }

  /** Shows a message wherever it lives: switches mailbox if needed, then selects it. */
  function open(id: string): boolean {
    if (!ensure(id)) return false
    const message = find(id)!
    if (!belongsTo(message, mailbox.value)) mailbox.value = message.mailbox
    query.value = ''
    select(id)
    return true
  }

  /**
   * New mail trickles in while Mail is open, the way it did on the old site.
   * Runs once per page load. The first arrival gets a banner; the rest are
   * filed quietly in Notification Center so the desktop doesn't turn into
   * a slot machine.
   */
  function startDeliveries() {
    if (deliveriesStarted) return
    deliveriesStarted = true
    for (const delivery of deliveries) {
      timers.push(
        setTimeout(() => {
          const message = deliver(delivery.message.id)
          if (!message) return
          useNotificationsStore().notify({
            app: 'email',
            title: message.from.name,
            body: message.subject,
            silent: bannersShown++ > 0,
            actions: [{ label: 'Show', openApp: 'email', run: () => open(message.id) }],
          })
        }, delivery.afterMs),
      )
    }
  }

  function stopDeliveries() {
    for (const timer of timers.splice(0)) clearTimeout(timer)
  }

  return {
    messages,
    mailbox,
    selectedId,
    query,
    unreadCount,
    counts,
    visible,
    selected,
    selectMailbox,
    select,
    neighbourOf,
    toggleFlag,
    setRead,
    moveToJunk,
    notJunk,
    trash,
    restore,
    replyDraft,
    send,
    ensure,
    open,
    startDeliveries,
    stopDeliveries,
  }
})
