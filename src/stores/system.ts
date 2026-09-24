import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { lock, restart as restartCopy, shutdown as shutdownCopy, sleep as sleepCopy } from '@/content/system'

export type SystemState = 'normal' | 'locked' | 'sleeping' | 'restarting' | 'shutting-down'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Power states for the Mac shell: lock, sleep, restart, shut down.
 * Restart genuinely reloads the page; shut down is a joke that comes back.
 */
export const useSystemStore = defineStore('system', () => {
  const currentState = ref<SystemState>('normal')
  const isTransitioning = ref(false)
  const lockScreenAttempts = ref(0)
  const isCoolingDown = ref(false)
  const sleepStartedAt = ref<number | null>(null)
  const systemMessage = ref('')
  const systemProgress = ref(0)

  const isLocked = computed(() => currentState.value === 'locked')
  const isSleeping = computed(() => currentState.value === 'sleeping')
  const isRestarting = computed(() => currentState.value === 'restarting')
  const isShuttingDown = computed(() => currentState.value === 'shutting-down')
  const isNormal = computed(() => currentState.value === 'normal')

  async function lockScreen() {
    if (isTransitioning.value || !isNormal.value) return
    isTransitioning.value = true
    systemMessage.value = lock.lockingMessage
    await wait(300)
    currentState.value = 'locked'
    lockScreenAttempts.value = 0
    isTransitioning.value = false
  }

  /** Resolves true when the password matches. Too many misses pause input briefly. */
  async function unlockScreen(password: string): Promise<boolean> {
    if (isTransitioning.value || isCoolingDown.value) return false
    if (password === lock.password) {
      isTransitioning.value = true
      systemMessage.value = lock.welcomeBack
      await wait(450)
      currentState.value = 'normal'
      lockScreenAttempts.value = 0
      isTransitioning.value = false
      return true
    }
    lockScreenAttempts.value++
    if (lockScreenAttempts.value >= lock.maxAttempts) {
      systemMessage.value = lock.tooManyAttemptsStatus
      isCoolingDown.value = true
      await wait(lock.cooldownMs)
      isCoolingDown.value = false
      lockScreenAttempts.value = 0
    }
    return false
  }

  async function sleep() {
    if (isTransitioning.value || !isNormal.value) return
    isTransitioning.value = true
    systemMessage.value = sleepCopy.goingToSleep
    sleepStartedAt.value = Date.now()
    await wait(500)
    currentState.value = 'sleeping'
    isTransitioning.value = false
  }

  /** Returns how long the machine slept, in whole seconds. */
  async function wakeUp(): Promise<number> {
    if (isTransitioning.value || !isSleeping.value) return 0
    isTransitioning.value = true
    const seconds = sleepStartedAt.value
      ? Math.floor((Date.now() - sleepStartedAt.value) / 1000)
      : 0
    systemMessage.value = sleepCopy.wokeUp(seconds)
    await wait(300)
    currentState.value = 'normal'
    sleepStartedAt.value = null
    isTransitioning.value = false
    return seconds
  }

  async function restart() {
    if (isTransitioning.value) return
    isTransitioning.value = true
    currentState.value = 'restarting'
    const steps = restartCopy.messages
    for (let i = 0; i < steps.length; i++) {
      systemMessage.value = steps[i]!
      systemProgress.value = ((i + 1) / steps.length) * 100
      await wait(restartCopy.stepMs)
    }
    window.location.reload()
  }

  async function shutdown() {
    if (isTransitioning.value) return
    isTransitioning.value = true
    currentState.value = 'shutting-down'
    const steps = shutdownCopy.messages
    for (let i = 0; i < steps.length; i++) {
      systemMessage.value = steps[i]!
      systemProgress.value = ((i + 1) / steps.length) * 100
      await wait(i >= shutdownCopy.punchlineFrom ? shutdownCopy.punchlineStepMs : shutdownCopy.stepMs)
    }
    reset()
  }

  function reset() {
    currentState.value = 'normal'
    isTransitioning.value = false
    isCoolingDown.value = false
    lockScreenAttempts.value = 0
    sleepStartedAt.value = null
    systemMessage.value = ''
    systemProgress.value = 0
  }

  return {
    currentState,
    isTransitioning,
    lockScreenAttempts,
    maxLockScreenAttempts: lock.maxAttempts,
    isCoolingDown,
    sleepStartedAt,
    systemMessage,
    systemProgress,
    isLocked,
    isSleeping,
    isRestarting,
    isShuttingDown,
    isNormal,
    lockScreen,
    unlockScreen,
    sleep,
    wakeUp,
    restart,
    shutdown,
    reset,
  }
})
