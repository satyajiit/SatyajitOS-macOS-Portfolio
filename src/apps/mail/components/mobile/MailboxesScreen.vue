<script setup lang="ts">
import { ArchiveX, Flag, Inbox, Send, SquarePen, Trash2 } from '@lucide/vue'
import type { Component } from 'vue'

import { mailboxCopy } from '@/content/mail'
import IosNavBar from '@/ui/mobile/IosNavBar.vue'
import UiListGroup from '@/ui/UiListGroup.vue'
import UiListRow from '@/ui/UiListRow.vue'

import { useMailStore, type MailboxView } from '../../store'
import IosToolbar from './IosToolbar.vue'

const emit = defineEmits<{ open: [box: MailboxView]; compose: [] }>()
const mail = useMailStore()

const groups: { header?: string; boxes: { id: MailboxView; icon: Component; tone: string }[] }[] = [
  {
    boxes: [
      { id: 'inbox', icon: Inbox, tone: 'text-accent' },
      { id: 'flagged', icon: Flag, tone: 'text-orange' },
    ],
  },
  {
    header: 'On My iPhone',
    boxes: [
      { id: 'sent', icon: Send, tone: 'text-accent' },
      { id: 'junk', icon: ArchiveX, tone: 'text-accent' },
      { id: 'trash', icon: Trash2, tone: 'text-accent' },
    ],
  },
]
</script>

<template>
  <section class="screen flex flex-col bg-ios-grouped">
    <div class="min-h-0 flex-1 overflow-y-auto pb-28">
      <IosNavBar title="Mailboxes" large />
      <UiListGroup v-for="(group, i) in groups" :key="i" :header="group.header">
        <UiListRow
          v-for="box in group.boxes"
          :key="box.id"
          :title="mailboxCopy[box.id].title"
          :detail="mail.counts[box.id] ? String(mail.counts[box.id]) : undefined"
          chevron
          @select="emit('open', box.id)"
        >
          <template #icon><component :is="box.icon" :class="box.tone" /></template>
        </UiListRow>
      </UiListGroup>
    </div>
    <IosToolbar>
      <span class="w-8" aria-hidden="true" />
      <p class="text-center text-ios-caption-1 text-ios-label">Updated Just Now</p>
      <button type="button" aria-label="New Message" @click="emit('compose')"><SquarePen /></button>
    </IosToolbar>
  </section>
</template>
