<script setup lang="ts">
import { ArrowUp } from '@lucide/vue'
import { computed, nextTick, ref, watch } from 'vue'

import { composeCopy } from '@/content/mail'
import { profile } from '@/content/profile'
import UiSpinner from '@/ui/UiSpinner.vue'
import IconText from '@/ui/IconText.vue'

import { isEmail, type Draft } from '../../store'

/**
 * iOS Mail's compose card: slides up over the app with Cancel on the left
 * and the round Send button on the right. Labelled inline rows, then the body.
 */
const props = defineProps<{ draft: Draft | null }>()
const emit = defineEmits<{ cancel: []; send: [draft: Draft] }>()

const to = ref('')
const subject = ref('')
const body = ref('')
const touched = ref(false)
const sending = ref(false)
const toInput = ref<HTMLInputElement | null>(null)
const bodyInput = ref<HTMLTextAreaElement | null>(null)

watch(
  () => props.draft,
  async (draft) => {
    if (!draft) return
    to.value = draft.to
    subject.value = draft.subject
    body.value = draft.body
    touched.value = false
    sending.value = false
    await nextTick()
    if (draft.body && bodyInput.value) {
      bodyInput.value.focus()
      bodyInput.value.setSelectionRange(0, 0)
      bodyInput.value.scrollTop = 0
    } else {
      toInput.value?.focus()
    }
  },
  { immediate: true },
)

const toInvalid = computed(() => touched.value && !!to.value && !isEmail(to.value))
const canSend = computed(
  () => isEmail(to.value) && !!subject.value.trim() && !!body.value.trim() && !sending.value,
)
const mailto = computed(() => {
  const params = new URLSearchParams({ subject: subject.value, body: body.value })
  return `mailto:${profile.email}?${params.toString().replace(/\+/g, '%20')}`
})

async function send() {
  touched.value = true
  if (!canSend.value) return
  sending.value = true
  await new Promise((r) => setTimeout(r, 700))
  emit('send', { to: to.value, subject: subject.value, body: body.value })
}
</script>

<template>
  <Transition name="scrim">
    <div
      v-if="draft"
      class="absolute inset-0 z-30 bg-scrim"
      aria-hidden="true"
      @click="emit('cancel')"
    />
  </Transition>
  <Transition name="card">
    <form
      v-if="draft"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-compose-title"
      class="card absolute inset-x-0 bottom-0 z-40 flex flex-col overflow-clip bg-ios-bg"
      @submit.prevent="send"
      @keydown.esc="emit('cancel')"
    >
      <header class="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center px-4 py-3">
        <button
          type="button"
          class="focus-ring justify-self-start text-ios-body text-accent active:opacity-40"
          :disabled="sending"
          @click="emit('cancel')"
        >
          Cancel
        </button>
        <h2 id="mobile-compose-title" class="text-ios-headline text-ios-label">New Message</h2>
        <button
          type="submit"
          class="send focus-ring justify-self-end"
          :aria-label="sending ? 'Sending' : 'Send'"
          :disabled="!canSend"
        >
          <UiSpinner v-if="sending" :size="18" label="Sending" />
          <ArrowUp v-else class="size-5" style="stroke-width: 2.6" />
        </button>
      </header>

      <label class="field">
        <span class="text-ios-label-secondary">To:</span>
        <input
          ref="toInput"
          v-model="to"
          type="email"
          inputmode="email"
          autocapitalize="none"
          autocomplete="email"
          class="min-w-0 flex-1 bg-transparent text-ios-label outline-none"
          :aria-invalid="toInvalid || undefined"
          aria-describedby="mobile-compose-to-error"
          @blur="touched = true"
        />
      </label>
      <p
        v-if="toInvalid"
        id="mobile-compose-to-error"
        role="alert"
        class="px-4 pt-1 text-ios-footnote text-red"
      >
        Enter an email address, like hello@example.com.
      </p>
      <label class="field">
        <span class="text-ios-label-secondary">Subject:</span>
        <input
          v-model="subject"
          type="text"
          class="min-w-0 flex-1 bg-transparent text-ios-label outline-none"
        />
      </label>
      <textarea
        ref="bodyInput"
        v-model="body"
        aria-label="Message"
        class="min-h-0 flex-1 resize-none bg-transparent px-4 py-3 text-ios-body text-ios-label outline-none"
      />
      <footer
        class="footer shrink-0 border-t border-ios-separator px-4 pt-2 text-ios-footnote text-ios-label-secondary"
      >
        <p><IconText :text="composeCopy.demoNote" /></p>
        <a :href="mailto" class="focus-ring mt-1 inline-block text-accent">Open in Mail</a>
      </footer>
    </form>
  </Transition>
</template>

<style scoped>
.card {
  top: calc(var(--ios-status-height, 0px) + 10px);
  border-radius: 12px 12px 0 0;
  box-shadow: var(--elev-popover);
}
.field {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  margin-left: 16px;
  padding-right: 16px;
  border-bottom: 0.5px solid var(--ios-separator);
  font-size: var(--text-ios-body);
  letter-spacing: var(--text-ios-body--letter-spacing);
}
.field:focus-within {
  border-bottom-color: var(--accent);
}
.send {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: var(--accent);
  color: var(--label-on-accent);
}
.send:active:not(:disabled) {
  filter: brightness(0.85);
}
.send:disabled {
  background: var(--ios-fill);
  color: var(--ios-label-tertiary);
}
.footer {
  padding-bottom: max(env(safe-area-inset-bottom), var(--ios-home-indicator-height, 20px));
}

.card-enter-active,
.card-leave-active {
  transition: transform var(--dur-long) var(--ease-out);
}
.card-leave-active {
  transition-duration: calc(var(--dur-long) * 0.75);
  transition-timing-function: var(--ease-in);
}
.card-enter-from,
.card-leave-to {
  transform: translateY(100%);
}
.scrim-enter-active,
.scrim-leave-active {
  transition: opacity var(--dur-long) var(--ease-out);
}
.scrim-enter-from,
.scrim-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .card-enter-from,
  .card-leave-to {
    transform: none;
    opacity: 0;
  }
  .card-enter-active,
  .card-leave-active {
    transition: opacity 150ms linear;
  }
}
</style>
