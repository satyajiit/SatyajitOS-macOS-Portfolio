<script setup lang="ts">
import { Flag } from '@lucide/vue'
import { nextTick, ref, watch } from 'vue'

import IconText from '@/ui/IconText.vue'

import type { MailboxView, MailMessage } from '../store'
import { listDate } from '../format'

/**
 * Mail's message list. The whole pane is one listbox: ↑/↓ move the
 * selection, Delete/Backspace trashes. Selection turns accent-blue while the
 * window is key and falls back to grey when it isn't, like AppKit tables.
 */
const props = defineProps<{
  messages: MailMessage[]
  selectedId: string | null
  mailbox: MailboxView
  label: string
  emphasized: boolean
  emptyTitle: string
  emptyMessage: string
}>()
const emit = defineEmits<{ select: [id: string]; trash: [id: string] }>()

const list = ref<HTMLElement | null>(null)

function move(delta: 1 | -1) {
  const i = props.messages.findIndex((m) => m.id === props.selectedId)
  const next = props.messages[i === -1 ? 0 : i + delta]
  if (next) emit('select', next.id)
}

watch(
  () => props.selectedId,
  async (id) => {
    if (!id) return
    await nextTick()
    list.value?.querySelector(`[data-id="${CSS.escape(id)}"]`)?.scrollIntoView({ block: 'nearest' })
  },
)

/** Sent mail lists who it went to; everything else lists who it came from. */
const person = (m: MailMessage) => (props.mailbox === 'sent' ? `To: ${m.to.name}` : m.from.name)
</script>

<template>
  <div
    ref="list"
    role="listbox"
    tabindex="0"
    class="message-list min-h-0 overflow-y-auto bg-window-content py-1.5 outline-none"
    :aria-label="label"
    :aria-activedescendant="selectedId ? `mail-row-${selectedId}` : undefined"
    @keydown.down.prevent="move(1)"
    @keydown.up.prevent="move(-1)"
    @keydown.delete.prevent="selectedId && emit('trash', selectedId)"
  >
    <div
      v-for="(message, i) in messages"
      :id="`mail-row-${message.id}`"
      :key="message.id"
      role="option"
      class="row"
      :class="{
        'is-selected': message.id === selectedId,
        'is-emphasized': emphasized,
        'before-selected': messages[i + 1]?.id === selectedId,
      }"
      :data-id="message.id"
      :aria-selected="message.id === selectedId"
      @click="emit('select', message.id)"
    >
      <span v-if="!message.read" class="dot" aria-label="Unread" />
      <div class="flex items-baseline gap-2">
        <span class="sender min-w-0 flex-1 truncate text-headline">{{ person(message) }}</span>
        <Flag v-if="message.flagged" class="flag size-3 shrink-0" aria-label="Flagged" />
        <span class="meta shrink-0 text-subheadline tabular">{{
          listDate(message.receivedAt)
        }}</span>
      </div>
      <p class="truncate text-body"><IconText :text="message.subject" /></p>
      <p class="meta preview text-body"><IconText :text="message.preview" /></p>
    </div>

    <div v-if="!messages.length" class="flex flex-col items-center gap-2 px-8 pt-16 text-center">
      <p class="text-title-3 text-label-secondary"><IconText :text="emptyTitle" /></p>
      <p class="max-w-[30ch] text-callout text-label-tertiary"><IconText :text="emptyMessage" /></p>
    </div>
  </div>
</template>

<style scoped>
.message-list:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: -3px;
}

.row {
  position: relative;
  margin: 0 8px;
  padding: 8px 12px 9px 22px;
  border-radius: var(--radius-lg);
  cursor: default;
  color: var(--label);
}
/* Hairline between rows, hidden next to the selection pill */
.row::after {
  content: '';
  position: absolute;
  left: 22px;
  right: 12px;
  bottom: 0;
  height: 1px;
  background: var(--separator);
}
.row:last-of-type::after,
.row.is-selected::after,
.row.before-selected::after {
  display: none;
}

.row:hover:not(.is-selected) {
  background: var(--fill-quaternary);
}
.row:active:not(.is-selected) {
  background: var(--fill-tertiary);
}
.row.is-selected {
  background: var(--selection-unemphasized);
}
.row.is-selected.is-emphasized {
  background: var(--selection);
  color: var(--label-on-accent);
}

.dot {
  position: absolute;
  left: 8px;
  top: 13px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--accent);
}
.is-selected.is-emphasized .dot {
  background: var(--label-on-accent);
}

.meta {
  color: var(--label-secondary);
}
.is-selected.is-emphasized .meta {
  color: color-mix(in srgb, var(--label-on-accent) 78%, transparent);
}

.flag {
  color: var(--sys-orange);
  fill: currentColor;
}
.is-selected.is-emphasized .flag {
  color: var(--label-on-accent);
}

.preview {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
