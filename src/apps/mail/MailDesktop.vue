<script setup lang="ts">
import {
  ArchiveRestore,
  ArchiveX,
  Flag,
  Inbox,
  MailCheck,
  Reply,
  Send,
  SquarePen,
  Trash2,
} from '@lucide/vue'
import { computed, onMounted, ref, type Component } from 'vue'

import { composeCopy, mailboxCopy } from '@/content/mail'
import { profile } from '@/content/profile'
import { useNotificationsStore } from '@/stores/notifications'
import UiIconButton from '@/ui/UiIconButton.vue'
import UiSearchField from '@/ui/UiSearchField.vue'
import UiSidebarItem from '@/ui/UiSidebarItem.vue'
import UiSidebarSection from '@/ui/UiSidebarSection.vue'
import { WindowSidebar, WindowToolbar, useWindowContext } from '@/ui/window'
import IconText from '@/ui/IconText.vue'

import ComposeSheet from './components/ComposeSheet.vue'
import MessageList from './components/MessageList.vue'
import MessageReader from './components/MessageReader.vue'
import { useMailStore, type Draft, type MailboxView } from './store'
import { useMailRouting } from './useMailRouting'

const mail = useMailStore()
const notifications = useNotificationsStore()
const windowCtx = useWindowContext()
const isKey = computed(() => windowCtx?.isKey.value ?? true)
const { show, linkedId } = useMailRouting()

const draft = ref<Draft | null>(null)

const sidebar: { title: string; boxes: { id: MailboxView; icon: Component; tint?: string }[] }[] = [
  {
    title: 'Favorites',
    boxes: [
      { id: 'inbox', icon: Inbox },
      { id: 'flagged', icon: Flag, tint: 'var(--sys-orange)' },
    ],
  },
  {
    title: 'On My Mac',
    boxes: [
      { id: 'sent', icon: Send },
      { id: 'junk', icon: ArchiveX },
      { id: 'trash', icon: Trash2 },
    ],
  },
]

const copy = computed(() => mailboxCopy[mail.mailbox])
const subtitle = computed(() => {
  const total = mail.visible.length
  if (mail.query.trim()) return `${total} ${total === 1 ? 'result' : 'results'}`
  const unread = mail.visible.filter((m) => !m.read).length
  const count = `${total} ${total === 1 ? 'message' : 'messages'}`
  return unread ? `${count}, ${unread} unread` : count
})

const selected = computed(() => mail.selected)

function pickMailbox(id: MailboxView) {
  mail.selectMailbox(id)
  show(null)
}

function pickMessage(id: string) {
  mail.select(id)
  show(id)
}

/** Optimistic move with an Undo on the banner instead of a confirmation. */
function trash(id: string) {
  const message = mail.messages.find((m) => m.id === id)
  if (!message) return
  const next = mail.neighbourOf(id)
  const result = mail.trash(id)
  if (next) pickMessage(next)
  else show(null)
  if (result === 'trashed') {
    notifications.notify({
      app: 'email',
      title: 'Moved to Trash',
      body: message.subject,
      duration: 4000,
      actions: [{ label: 'Undo', run: () => mail.restore(id) }],
    })
  }
}

function junkOrRestore(id: string) {
  const message = mail.messages.find((m) => m.id === id)
  if (!message) return
  const next = mail.neighbourOf(id)
  if (message.mailbox === 'junk') mail.notJunk(id)
  else if (message.mailbox === 'trash') mail.restore(id)
  else {
    mail.moveToJunk(id)
    notifications.notify({
      app: 'email',
      title: 'Moved to Junk',
      body: message.subject,
      duration: 4000,
      actions: [{ label: 'Undo', run: () => mail.notJunk(id) }],
    })
  }
  if (next) pickMessage(next)
  else show(null)
}

const junkAction = computed(() => {
  if (mail.selected?.mailbox === 'junk') return { label: 'Not Junk', icon: MailCheck }
  if (mail.selected?.mailbox === 'trash') return { label: 'Restore', icon: ArchiveRestore }
  return { label: 'Move to Junk', icon: ArchiveX }
})

const compose = () => (draft.value = { to: profile.email, subject: '', body: '' })
const reply = () => mail.selectedId && (draft.value = mail.replyDraft(mail.selectedId))

function sent(outgoing: Draft) {
  const message = mail.send(outgoing)
  draft.value = null
  // Show where it went, like the old site did.
  mail.selectMailbox('sent')
  pickMessage(message.id)
  notifications.notify({
    app: 'email',
    kind: 'success',
    title: composeCopy.sentTitle,
    body: composeCopy.sentBody,
  })
}

onMounted(() => {
  mail.startDeliveries()
  // Open on the newest message, as Mail does, unless a link picked one.
  if (!linkedId.value && !mail.selectedId && mail.visible[0]) pickMessage(mail.visible[0].id)
})
</script>

<template>
  <div class="relative flex min-h-0 flex-1">
    <WindowSidebar :width="200" label="Mailboxes">
      <UiSidebarSection v-for="section in sidebar" :key="section.title" :title="section.title">
        <UiSidebarItem
          v-for="box in section.boxes"
          :key="box.id"
          :selected="mail.mailbox === box.id"
          :count="mail.counts[box.id] || undefined"
          :tint="box.tint"
          @select="pickMailbox(box.id)"
        >
          <template #icon><component :is="box.icon" /></template>
          <IconText :text="mailboxCopy[box.id].title" />
        </UiSidebarItem>
      </UiSidebarSection>
    </WindowSidebar>

    <div class="flex min-w-0 flex-1 flex-col">
      <WindowToolbar :lights="false" :title="copy.title" :subtitle="subtitle">
        <template #trailing>
          <UiIconButton label="New Message" @click="compose"><SquarePen /></UiIconButton>
          <span class="mx-1 h-5 w-px bg-separator" aria-hidden="true" />
          <UiIconButton label="Reply" :disabled="!selected" @click="reply"><Reply /></UiIconButton>
          <UiIconButton
            :label="selected?.flagged ? 'Unflag' : 'Flag'"
            :pressed="selected ? selected.flagged : undefined"
            :disabled="!selected"
            @click="selected && mail.toggleFlag(selected.id)"
          >
            <Flag :class="selected?.flagged ? 'fill-orange text-orange' : ''" />
          </UiIconButton>
          <UiIconButton
            :label="junkAction.label"
            :disabled="!selected"
            @click="selected && junkOrRestore(selected.id)"
          >
            <component :is="junkAction.icon" />
          </UiIconButton>
          <UiIconButton
            :label="selected?.mailbox === 'trash' ? 'Delete Permanently' : 'Delete'"
            :disabled="!selected"
            @click="selected && trash(selected.id)"
          >
            <Trash2 />
          </UiIconButton>
          <div class="ml-1 w-44">
            <UiSearchField v-model="mail.query" :placeholder="`Search ${copy.title}`" />
          </div>
        </template>
      </WindowToolbar>

      <div class="flex min-h-0 flex-1">
        <MessageList
          class="w-[320px] shrink-0 border-r border-separator"
          :messages="mail.visible"
          :selected-id="mail.selectedId"
          :mailbox="mail.mailbox"
          :label="copy.title"
          :emphasized="isKey"
          :empty-title="mail.query.trim() ? 'No Results' : copy.emptyTitle"
          :empty-message="
            mail.query.trim()
              ? `Nothing in ${copy.title} matches “${mail.query}”.`
              : copy.emptyMessage
          "
          @select="pickMessage"
          @trash="trash"
        />
        <MessageReader class="min-w-0 flex-1" :message="selected" />
      </div>
    </div>

    <ComposeSheet :draft="draft" @cancel="draft = null" @send="sent" />
  </div>
</template>
