import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'

import {
  brewing,
  coffeeTypes,
  form as copy,
  mailDraft,
  meetingTypes,
  notifications,
  topicMessage,
  topics,
  type CoffeeType,
  type MeetingType,
  type Topic,
} from '@/content/coffee'
import { profile } from '@/content/profile'
import { useNotificationsStore } from '@/stores/notifications'

export type SubmitState = 'idle' | 'loading' | 'success' | 'error'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Everything Coffee Chat does, shared by the Mac window and the phone app:
 * the capsule machine that brews on open, topic and coffee picks, the form,
 * and the booking itself (which posts a notification with an "Open Mail" action).
 */
export function useCoffeeBooking() {
  const notify = useNotificationsStore().notify

  // The machine: one step every `stepInterval` ms, last step means "ready".
  const step = ref(0)
  let timers: ReturnType<typeof setTimeout>[] = []
  const lastStep = brewing.steps.length - 1
  const isBrewing = computed(() => step.value < lastStep)
  const brewProgress = computed(() => (step.value / lastStep) * 100)
  const brewMessage = computed(() => brewing.steps[step.value] ?? '')
  const brewReading = computed(() =>
    step.value >= 3 ? brewing.hotReading : brewing.warmingReading,
  )

  function clearTimers() {
    timers.forEach(clearTimeout)
    timers = []
  }

  function brew() {
    clearTimers()
    step.value = 0
    for (let i = 1; i <= lastStep; i++) {
      timers.push(setTimeout(() => (step.value = i), i * brewing.stepInterval))
    }
  }

  onMounted(brew)
  onUnmounted(clearTimers)

  // Picks
  const topicId = ref<string | null>(null)
  const coffeeId = ref<string | null>(null)
  const topic = computed(() => topics.find((t) => t.id === topicId.value) ?? null)
  const coffee = computed(() => coffeeTypes.find((c) => c.id === coffeeId.value) ?? null)

  const details = reactive({
    name: '',
    email: '',
    when: '',
    message: '',
    meetingType: 'video' as MeetingType['id'],
  })
  const errors = reactive({ name: '', email: '' })
  const state = ref<SubmitState>('idle')

  function pickTopic(next: Topic) {
    topicId.value = next.id
    details.message = topicMessage(next)
    notify({ app: 'coffee', ...notifications.topicPicked(next.title), duration: 3500 })
  }

  function pickCoffee(next: CoffeeType) {
    coffeeId.value = next.id
    notify({ app: 'coffee', ...notifications.coffeePicked(next.analysis), duration: 4000 })
  }

  function validate(): boolean {
    errors.name = details.name.trim() ? '' : copy.errors.name
    const email = details.email.trim()
    errors.email = !email ? copy.errors.email : EMAIL.test(email) ? '' : copy.errors.emailFormat
    return !errors.name && !errors.email
  }

  function reset() {
    Object.assign(details, { name: '', email: '', when: '', message: '', meetingType: 'video' })
    topicId.value = null
    coffeeId.value = null
  }

  async function book() {
    if (state.value === 'loading') return
    if (!validate()) {
      state.value = 'error'
      notify({ app: 'coffee', kind: 'warning', ...notifications.missingInfo })
      timers.push(setTimeout(() => (state.value = 'idle'), 1600))
      return
    }
    state.value = 'loading'
    // A beat so the spinner reads as "sending", not as a glitch.
    await new Promise((resolve) => timers.push(setTimeout(resolve, 900)))
    state.value = 'success'
    notify({
      app: 'coffee',
      kind: 'success',
      title: notifications.booked.title,
      body: coffee.value?.booked ?? notifications.booked.fallback,
      actions: [{ label: notifications.booked.openMail, openApp: 'email' }],
      duration: 7000,
    })
    timers.push(
      setTimeout(() => {
        reset()
        state.value = 'idle'
      }, 2000),
    )
  }

  /** Pre-filled email with whatever has been typed so far. */
  const mailtoHref = computed(() => {
    const meeting = meetingTypes.find((m) => m.id === details.meetingType)
    const body = mailDraft.body([
      details.message,
      '',
      details.name && `Name: ${details.name}`,
      details.email && `Email: ${details.email}`,
      details.when && `Preferred time: ${details.when.replace('T', ' ')}`,
      meeting && `Meeting type: ${meeting.label}`,
      topic.value && `Topic: ${topic.value.title}`,
      coffee.value && `Coffee: ${coffee.value.name}`,
    ])
    return `mailto:${profile.email}?subject=${encodeURIComponent(mailDraft.subject)}&body=${encodeURIComponent(body)}`
  })

  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) errors[field] = ''
  }

  return {
    step,
    isBrewing,
    brewProgress,
    brewMessage,
    brewReading,
    brew,
    topicId,
    coffeeId,
    topic,
    coffee,
    details,
    errors,
    state,
    pickTopic,
    pickCoffee,
    book,
    mailtoHref,
    clearError,
  }
}
