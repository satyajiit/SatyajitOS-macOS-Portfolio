<script setup lang="ts">
import {
  ArchiveRestore,
  ArchiveX,
  ChevronDown,
  ChevronUp,
  Flag,
  MailCheck,
  Reply,
  SquarePen,
  Trash2,
} from '@lucide/vue'
import { computed } from 'vue'

import { mailboxCopy } from '@/content/mail'
import IosNavBar from '@/ui/mobile/IosNavBar.vue'
import IconText from '@/ui/IconText.vue'

import { fullDate } from '../../format'
import { useMailStore } from '../../store'
import MailAvatar from '../MailAvatar.vue'
import IosToolbar from './IosToolbar.vue'

const emit = defineEmits<{
  back: []
  step: [id: string]
  reply: [id: string]
  compose: []
  trash: [id: string]
  junk: [id: string]
}>()
const mail = useMailStore()
const message = computed(() => mail.selected)

/** Neighbours in the list, for the ⌃/⌄ buttons in the navigation bar. */
const position = computed(() => mail.visible.findIndex((m) => m.id === mail.selectedId))
const previous = computed(() => mail.visible[position.value - 1]?.id)
const next = computed(() => mail.visible[position.value + 1]?.id)

const junkAction = computed(() => {
  if (message.value?.mailbox === 'junk') return { label: 'Not Junk', icon: MailCheck }
  if (message.value?.mailbox === 'trash') return { label: 'Restore', icon: ArchiveRestore }
  return { label: 'Move to Junk', icon: ArchiveX }
})
</script>

<template>
  <section class="screen flex flex-col bg-ios-bg">
    <div class="min-h-0 flex-1 overflow-y-auto pb-28">
      <IosNavBar title="" :back="mailboxCopy[mail.mailbox].title" @back="emit('back')">
        <template #trailing>
          <button
            type="button"
            class="focus-ring grid size-8 place-items-center disabled:text-ios-label-tertiary active:opacity-40"
            aria-label="Previous message"
            :disabled="!previous"
            @click="previous && emit('step', previous)"
          >
            <ChevronUp class="size-6" />
          </button>
          <button
            type="button"
            class="focus-ring grid size-8 place-items-center disabled:text-ios-label-tertiary active:opacity-40"
            aria-label="Next message"
            :disabled="!next"
            @click="next && emit('step', next)"
          >
            <ChevronDown class="size-6" />
          </button>
        </template>
      </IosNavBar>

      <article v-if="message" :key="message.id" class="select-text px-4">
        <header class="flex items-center gap-3 border-b border-ios-separator py-3">
          <MailAvatar :name="message.from.name" :address="message.from.address" :brand="message.from.brand" :size="40" />
          <div class="min-w-0 flex-1">
            <div class="flex items-baseline gap-2">
              <span class="min-w-0 flex-1 truncate text-ios-headline text-ios-label">
                {{ message.from.name }}
              </span>
              <Flag
                v-if="message.flagged"
                class="size-3 shrink-0 fill-orange text-orange"
                aria-label="Flagged"
              />
            </div>
            <p class="truncate text-ios-footnote text-ios-label-secondary">
              To: {{ message.to.name }}
            </p>
          </div>
        </header>
        <h1 class="pt-3 text-ios-title-3 font-semibold text-ios-label"><IconText :text="message.subject" /></h1>
        <p class="pt-0.5 text-ios-footnote text-ios-label-secondary">
          {{ fullDate(message.receivedAt) }} · {{ message.tag }}
        </p>
        <div class="body whitespace-pre-wrap pt-4 text-ios-body text-ios-label">
          <IconText :text="message.body" />
        </div>
      </article>
    </div>

    <IosToolbar v-if="message">
      <button
        type="button"
        :aria-label="message.flagged ? 'Unflag' : 'Flag'"
        @click="mail.toggleFlag(message.id)"
      >
        <Flag :class="message.flagged ? 'fill-orange text-orange' : ''" />
      </button>
      <button type="button" :aria-label="junkAction.label" @click="emit('junk', message.id)">
        <component :is="junkAction.icon" />
      </button>
      <button type="button" aria-label="Delete" @click="emit('trash', message.id)">
        <Trash2 />
      </button>
      <button type="button" aria-label="Reply" @click="emit('reply', message.id)"><Reply /></button>
      <button type="button" aria-label="New Message" @click="emit('compose')"><SquarePen /></button>
    </IosToolbar>
  </section>
</template>

<style scoped>
.body {
  overflow-wrap: anywhere;
}
</style>
