import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { AppId } from '@/apps/registry'

export type NotificationKind = 'info' | 'success' | 'warning' | 'error'

export interface NotificationAction {
  label: string
  /** Opens this app when the action is picked (handled by the shell). */
  openApp?: AppId
  run?: () => void
}

export interface OsNotification {
  id: string
  title: string
  body: string
  /** The app that posted it; its icon is shown on the banner. Omit for "system". */
  app?: AppId
  kind: NotificationKind
  createdAt: number
  actions?: NotificationAction[]
}

export interface NotifyInput {
  title: string
  body?: string
  app?: AppId
  kind?: NotificationKind
  actions?: NotificationAction[]
  /** Banner time on screen in ms. 0 keeps it until dismissed. Default 5000. */
  duration?: number
  /** Skip the banner and only file it in Notification Center. */
  silent?: boolean
}

let counter = 0

/**
 * One notification system for both shells. `banners` are the transient
 * toasts (top-right on macOS, top on iPhone); `history` feeds Notification
 * Center. Do Not Disturb suppresses banners but still files history.
 */
export const useNotificationsStore = defineStore('notifications', () => {
  const history = ref<OsNotification[]>([])
  const bannerIds = ref<string[]>([])
  const doNotDisturb = ref(false)
  const timers = new Map<string, ReturnType<typeof setTimeout>>()

  const banners = computed(() =>
    bannerIds.value
      .map((id) => history.value.find((n) => n.id === id))
      .filter((n): n is OsNotification => !!n),
  )

  function dismissBanner(id: string) {
    bannerIds.value = bannerIds.value.filter((b) => b !== id)
    const timer = timers.get(id)
    if (timer) clearTimeout(timer)
    timers.delete(id)
  }

  function notify(input: NotifyInput): string {
    const id = `n${Date.now().toString(36)}${(counter++).toString(36)}`
    history.value.unshift({
      id,
      title: input.title,
      body: input.body ?? '',
      app: input.app,
      kind: input.kind ?? 'info',
      createdAt: Date.now(),
      actions: input.actions,
    })
    if (history.value.length > 50) history.value.length = 50

    if (!input.silent && !doNotDisturb.value) {
      // macOS stacks at most a few banners; the oldest makes room.
      bannerIds.value = [id, ...bannerIds.value].slice(0, 3)
      const duration = input.duration ?? 5000
      if (duration > 0) timers.set(id, setTimeout(() => dismissBanner(id), duration))
    }
    return id
  }

  function remove(id: string) {
    dismissBanner(id)
    history.value = history.value.filter((n) => n.id !== id)
  }

  function clearAll() {
    for (const id of bannerIds.value) dismissBanner(id)
    history.value = []
  }

  const setDoNotDisturb = (on: boolean) => {
    doNotDisturb.value = on
    if (on) for (const id of [...bannerIds.value]) dismissBanner(id)
  }

  return { history, banners, doNotDisturb, notify, dismissBanner, remove, clearAll, setDoNotDisturb }
})
