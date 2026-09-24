<script setup lang="ts">
import { ArchiveRestore, ChevronRight, Flag, Mail, MailOpen, SquarePen, Trash2 } from '@lucide/vue'
import { computed } from 'vue'

import { mailboxCopy } from '@/content/mail'
import IosNavBar from '@/ui/mobile/IosNavBar.vue'
import UiSearchField from '@/ui/UiSearchField.vue'
import IconText from '@/ui/IconText.vue'

import { listDate } from '../../format'
import { useMailStore, type MailMessage } from '../../store'
import IosToolbar from './IosToolbar.vue'
import SwipeRow from './SwipeRow.vue'
import type { SwipeAction } from './types'

const emit = defineEmits<{
  back: []
  open: [id: string]
  compose: []
  trash: [id: string]
}>()
const mail = useMailStore()
const copy = computed(() => mailboxCopy[mail.mailbox])

const unread = computed(() => mail.visible.filter((m) => !m.read).length)
const person = (m: MailMessage) => (mail.mailbox === 'sent' ? `To: ${m.to.name}` : m.from.name)

function trailing(m: MailMessage): SwipeAction[] {
  if (m.mailbox === 'trash') {
    return [
      { label: 'Restore', icon: ArchiveRestore, tone: 'accent', run: () => mail.restore(m.id) },
      { label: 'Delete', icon: Trash2, tone: 'red', run: () => emit('trash', m.id) },
    ]
  }
  return [
    {
      label: m.flagged ? 'Unflag' : 'Flag',
      icon: Flag,
      tone: 'orange',
      run: () => mail.toggleFlag(m.id),
    },
    { label: 'Trash', icon: Trash2, tone: 'red', run: () => emit('trash', m.id) },
  ]
}

const leading = (m: MailMessage): SwipeAction => ({
  label: m.read ? 'Unread' : 'Read',
  icon: m.read ? Mail : MailOpen,
  tone: 'accent',
  run: () => mail.setRead(m.id, !m.read),
})
</script>

<template>
  <section class="screen flex flex-col bg-ios-bg">
    <div class="min-h-0 flex-1 overflow-y-auto pb-28">
      <IosNavBar :title="copy.title" large back="Mailboxes" @back="emit('back')" />
      <div class="px-4 pb-2">
        <UiSearchField v-model="mail.query" platform="ios" />
      </div>

      <ul role="list">
        <SwipeRow
          v-for="message in mail.visible"
          :key="message.id"
          :trailing="trailing(message)"
          :leading="leading(message)"
          @tap="emit('open', message.id)"
        >
          <div
            class="row relative py-2.5 pl-[30px] pr-4"
            :class="{ 'is-selected': message.id === mail.selectedId }"
          >
            <span v-if="!message.read" class="dot" aria-label="Unread" />
            <div class="flex items-baseline gap-1.5">
              <span class="min-w-0 flex-1 truncate text-ios-headline text-ios-label">
                {{ person(message) }}
              </span>
              <Flag
                v-if="message.flagged"
                class="size-3 shrink-0 fill-orange text-orange"
                aria-label="Flagged"
              />
              <span class="shrink-0 text-ios-subheadline text-ios-label-secondary tabular">
                {{ listDate(message.receivedAt) }}
              </span>
              <ChevronRight
                class="size-3.5 shrink-0 self-center text-ios-label-tertiary"
                aria-hidden="true"
              />
            </div>
            <p class="truncate text-ios-subheadline text-ios-label"><IconText :text="message.subject" /></p>
            <p class="preview text-ios-subheadline text-ios-label-secondary">
              <IconText :text="message.preview" />
            </p>
          </div>
        </SwipeRow>
      </ul>

      <div
        v-if="!mail.visible.length"
        class="flex flex-col items-center gap-2 px-10 pt-20 text-center"
      >
        <p class="text-ios-title-3 text-ios-label">
          <IconText :text="mail.query.trim() ? 'No Results' : copy.emptyTitle" />
        </p>
        <p class="text-ios-subheadline text-ios-label-secondary">
          <IconText
            :text="
              mail.query.trim()
                ? `Nothing in ${copy.title} matches “${mail.query}”.`
                : copy.emptyMessage
            "
          />
        </p>
      </div>
    </div>

    <IosToolbar>
      <span class="w-8" aria-hidden="true" />
      <p class="text-center text-ios-caption-1 leading-tight">
        <span class="block text-ios-label">Updated Just Now</span>
        <span v-if="unread" class="block text-ios-label-secondary">{{ unread }} Unread</span>
      </p>
      <button type="button" aria-label="New Message" @click="emit('compose')"><SquarePen /></button>
    </IosToolbar>
  </section>
</template>

<style scoped>
.row::after {
  content: '';
  position: absolute;
  left: 30px;
  right: 0;
  bottom: 0;
  height: 0.5px;
  background: var(--ios-separator);
}
.row:active,
.row.is-selected {
  background: var(--ios-fill-tertiary);
}
.dot {
  position: absolute;
  left: 11px;
  top: 17px;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--accent);
}
.preview {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
