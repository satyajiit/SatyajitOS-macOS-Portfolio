<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { composeCopy } from '@/content/mail'
import { profile } from '@/content/profile'
import { useNotificationsStore } from '@/stores/notifications'

import MailboxesScreen from './components/mobile/MailboxesScreen.vue'
import MessageListScreen from './components/mobile/MessageListScreen.vue'
import MessageScreen from './components/mobile/MessageScreen.vue'
import MobileCompose from './components/mobile/MobileCompose.vue'
import { useMailStore, type Draft, type MailboxView } from './store'
import { useMailRouting } from './useMailRouting'

/**
 * iOS Mail: a navigation stack of Mailboxes → message list → message, with
 * compose as a card over the top. Opens on the Inbox, as the real app does.
 */
type Screen = 'mailboxes' | 'list' | 'message'

const mail = useMailStore()
const notifications = useNotificationsStore()

const screen = ref<Screen>('list')
const direction = ref<'push' | 'pop'>('push')
const draft = ref<Draft | null>(null)

const { show, linkedId } = useMailRouting(() => go('message', 'push'))

function go(next: Screen, dir: 'push' | 'pop') {
  direction.value = dir
  screen.value = next
}

function openMailbox(box: MailboxView) {
  mail.selectMailbox(box)
  go('list', 'push')
}

function openMessage(id: string) {
  mail.select(id)
  show(id)
  go('message', 'push')
}

function backToList() {
  show(null)
  go('list', 'pop')
  // Let the highlight linger under the pop, then clear it.
  setTimeout(() => mail.select(null), 420)
}

function step(id: string) {
  mail.select(id)
  show(id)
}

/** Optimistic, with Undo on the banner instead of an "Are you sure?". */
function trash(id: string) {
  const message = mail.messages.find((m) => m.id === id)
  if (!message) return
  const result = mail.trash(id)
  if (screen.value === 'message') backToList()
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

function junk(id: string) {
  const message = mail.messages.find((m) => m.id === id)
  if (!message) return
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
  backToList()
}

const compose = () => (draft.value = { to: profile.email, subject: '', body: '' })
const reply = (id: string) => (draft.value = mail.replyDraft(id))

function sent(outgoing: Draft) {
  mail.send(outgoing)
  draft.value = null
  notifications.notify({
    app: 'email',
    kind: 'success',
    title: composeCopy.sentTitle,
    body: composeCopy.sentBody,
  })
}

onMounted(() => {
  mail.startDeliveries()
  if (linkedId.value && mail.selectedId === linkedId.value) screen.value = 'message'
})
</script>

<template>
  <div class="mail-mobile relative h-full overflow-clip bg-ios-bg">
    <Transition :name="direction">
      <MailboxesScreen
        v-if="screen === 'mailboxes'"
        key="mailboxes"
        class="absolute inset-0"
        @open="openMailbox"
        @compose="compose"
      />
      <MessageListScreen
        v-else-if="screen === 'list'"
        key="list"
        class="absolute inset-0"
        @back="go('mailboxes', 'pop')"
        @open="openMessage"
        @compose="compose"
        @trash="trash"
      />
      <MessageScreen
        v-else
        key="message"
        class="absolute inset-0"
        @back="backToList"
        @step="step"
        @reply="reply"
        @compose="compose"
        @trash="trash"
        @junk="junk"
      />
    </Transition>

    <MobileCompose :draft="draft" @cancel="draft = null" @send="sent" />
  </div>
</template>

<style scoped>
/* UINavigationController push/pop: the new screen slides over, the old one
   drifts a third of the way and dims. */
.push-enter-active,
.push-leave-active,
.pop-enter-active,
.pop-leave-active {
  transition:
    transform var(--dur-long) var(--ease-out),
    opacity var(--dur-long) var(--ease-out);
}
.push-enter-active,
.pop-leave-active {
  z-index: 2;
  box-shadow: var(--elev-popover);
}
.push-enter-from,
.pop-leave-to {
  transform: translateX(100%);
}
.push-leave-to,
.pop-enter-from {
  transform: translateX(-30%);
  opacity: 0.7;
}

@media (prefers-reduced-motion: reduce) {
  .push-enter-from,
  .pop-leave-to,
  .push-leave-to,
  .pop-enter-from {
    transform: none;
    opacity: 0;
  }
}
</style>
