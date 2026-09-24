<script setup lang="ts">
import { ExternalLink, Send } from '@lucide/vue'
import { usePreferredReducedMotion } from '@vueuse/core'
import { AnimatePresence, motion } from 'motion-v'
import { computed, nextTick, ref, watch } from 'vue'

import { composeCopy } from '@/content/mail'
import { profile } from '@/content/profile'
import { spring } from '@/design/motion'
import UiButton from '@/ui/UiButton.vue'
import UiTextField from '@/ui/UiTextField.vue'
import IconText from '@/ui/IconText.vue'

import { isEmail, type Draft } from '../store'

/**
 * New Message, as a sheet that drops from under the toolbar and dims the
 * window. Send files the message in Sent (it never leaves the tab); "Open in
 * Mail" hands the draft to the visitor's real mail client, addressed to the owner.
 */
const props = defineProps<{ draft: Draft | null }>()
const emit = defineEmits<{ cancel: []; send: [draft: Draft] }>()

const to = ref('')
const subject = ref('')
const body = ref('')
const touched = ref(false)
const state = ref<'idle' | 'loading' | 'success'>('idle')
const fields = ref<HTMLElement | null>(null)
const reduced = usePreferredReducedMotion()

watch(
  () => props.draft,
  async (draft) => {
    if (!draft) return
    to.value = draft.to
    subject.value = draft.subject
    body.value = draft.body
    touched.value = false
    state.value = 'idle'
    await nextTick()
    // Replies land in the body; new messages start at To.
    const target = draft.body ? 'textarea' : 'input'
    const field = fields.value?.querySelector<HTMLElement>(target)
    field?.focus()
    if (field instanceof HTMLTextAreaElement) {
      field.setSelectionRange(0, 0)
      field.scrollTop = 0
    }
  },
  { immediate: true },
)

const toError = computed(() =>
  touched.value && to.value && !isEmail(to.value)
    ? 'Enter an email address, like hello@example.com.'
    : undefined,
)
const canSend = computed(
  () =>
    isEmail(to.value) && !!subject.value.trim() && !!body.value.trim() && state.value === 'idle',
)

const mailto = computed(() => {
  const params = new URLSearchParams({ subject: subject.value, body: body.value })
  return `mailto:${profile.email}?${params.toString().replace(/\+/g, '%20')}`
})

async function send() {
  touched.value = true
  if (!canSend.value) return
  state.value = 'loading'
  await new Promise((r) => setTimeout(r, 700))
  state.value = 'success'
  await new Promise((r) => setTimeout(r, 450))
  emit('send', { to: to.value, subject: subject.value, body: body.value })
}

const enter = computed(() =>
  reduced.value === 'reduce'
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.15 } }
    : {
        initial: { opacity: 0, y: -12 },
        animate: { opacity: 1, y: 0 },
        transition: spring.default,
      },
)
</script>

<template>
  <AnimatePresence>
    <motion.div
      v-if="draft"
      key="scrim"
      class="absolute inset-0 z-20 bg-scrim"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0, transition: { duration: 0.16 } }"
      @keydown.esc="emit('cancel')"
    >
      <motion.form
        role="dialog"
        aria-modal="true"
        aria-labelledby="compose-title"
        class="sheet absolute left-1/2 top-(--toolbar-height) flex max-h-[calc(100%-var(--toolbar-height)-16px)] w-[520px] max-w-[calc(100%-48px)] -translate-x-1/2 flex-col gap-3 overflow-y-auto rounded-sheet bg-window p-5 shadow-popover"
        :initial="enter.initial"
        :animate="enter.animate"
        :exit="{ opacity: 0, transition: { duration: 0.16 } }"
        :transition="enter.transition"
        data-no-drag
        @submit.prevent="send"
        @keydown.meta.enter.prevent="send"
      >
        <h2 id="compose-title" class="text-headline text-label">New Message</h2>
        <div ref="fields" class="flex flex-col gap-3">
          <UiTextField
            v-model="to"
            label="To"
            type="email"
            placeholder="name@example.com"
            :error="toError"
            @focusout="touched = true"
          />
          <UiTextField v-model="subject" label="Subject" placeholder="What’s it about?" />
          <UiTextField
            v-model="body"
            label="Message"
            multiline
            :rows="9"
            placeholder="Say hello…"
          />
        </div>
        <p class="text-subheadline text-label-secondary"><IconText :text="composeCopy.demoNote" /></p>
        <div class="mt-1 flex items-center gap-2">
          <a
            :href="mailto"
            class="focus-ring mr-auto inline-flex items-center gap-1.5 rounded-control px-1 text-body text-link hover:underline"
          >
            <ExternalLink class="size-3.5" aria-hidden="true" />
            Open in Mail
          </a>
          <UiButton :disabled="state !== 'idle'" @click="emit('cancel')">Cancel</UiButton>
          <UiButton
            type="submit"
            variant="primary"
            :state="state === 'loading' ? 'loading' : state === 'success' ? 'success' : 'idle'"
            :disabled="!canSend && state === 'idle'"
          >
            <template v-if="state === 'idle'" #icon>
              <Send class="size-3.5" aria-hidden="true" />
            </template>
            {{ state === 'success' ? 'Sent' : 'Send' }}
          </UiButton>
        </div>
      </motion.form>
    </motion.div>
  </AnimatePresence>
</template>

<style scoped>
.sheet {
  box-shadow:
    var(--elev-popover),
    inset 0 0.5px 0 var(--edge-light);
}
</style>
