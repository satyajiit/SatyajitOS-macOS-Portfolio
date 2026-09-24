<script setup lang="ts">
import { Flag } from '@lucide/vue'
import { motion } from 'motion-v'

import IconText from '@/ui/IconText.vue'

import type { MailMessage } from '../store'
import { fullDate } from '../format'
import MailAvatar from './MailAvatar.vue'

/** The reading pane: sender header, subject, then the body as plain text. */
defineProps<{ message: MailMessage | null }>()
</script>

<template>
  <div class="min-h-0 overflow-y-auto bg-window-content">
    <motion.article
      v-if="message"
      :key="message.id"
      class="select-text"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :transition="{ duration: 0.15 }"
    >
      <header class="flex gap-3 border-b border-separator px-6 pb-4 pt-5">
        <MailAvatar :name="message.from.name" :address="message.from.address" :brand="message.from.brand" :size="40" />
        <div class="min-w-0 flex-1">
          <div class="flex items-baseline gap-2">
            <h2 class="min-w-0 flex-1 truncate text-headline text-label">
              {{ message.from.name }}
            </h2>
            <Flag
              v-if="message.flagged"
              class="size-3 shrink-0 fill-orange text-orange"
              aria-label="Flagged"
            />
            <time class="shrink-0 text-subheadline text-label-secondary">
              {{ fullDate(message.receivedAt) }}
            </time>
          </div>
          <p class="mt-0.5 text-body font-semibold text-label"><IconText :text="message.subject" /></p>
          <p class="mt-0.5 flex items-center gap-2 text-subheadline text-label-secondary">
            <span class="truncate">To: {{ message.to.name }}</span>
            <span
              class="shrink-0 rounded-sm bg-fill-secondary px-1.5 text-footnote text-label-secondary"
            >
              {{ message.tag }}
            </span>
          </p>
        </div>
      </header>
      <div class="body max-w-[68ch] whitespace-pre-wrap px-6 py-5 text-body text-label">
        <IconText :text="message.body" />
      </div>
    </motion.article>

    <div v-else class="grid h-full place-items-center">
      <p class="text-title-2 text-label-tertiary">No Message Selected</p>
    </div>
  </div>
</template>

<style scoped>
.body {
  line-height: 20px;
  overflow-wrap: anywhere;
}
</style>
