import { useMobileStore } from '@/stores/mobile'
import {
  useNotificationsStore,
  type NotificationAction,
  type OsNotification,
} from '@/stores/notifications'

/**
 * What acting on a notification means on the phone: a button runs its action
 * and/or opens its app; a tap on the card opens the posting app (or runs the
 * only action there is).
 */
export function useNotificationActions() {
  const store = useMobileStore()
  const notifications = useNotificationsStore()

  function runAction(n: OsNotification, action: NotificationAction) {
    notifications.remove(n.id)
    action.run?.()
    if (action.openApp) store.openApp(action.openApp)
  }

  /** Tap on the card body. Returns false when there was nothing to open or run. */
  function openNotification(n: OsNotification): boolean {
    const target = n.actions?.find((a) => a.openApp)?.openApp ?? n.app
    if (target) {
      notifications.dismissBanner(n.id)
      store.openApp(target)
      return true
    }
    const run = n.actions?.find((a) => a.run)?.run
    if (run) {
      notifications.remove(n.id)
      run()
      return true
    }
    return false
  }

  return { runAction, openNotification }
}
