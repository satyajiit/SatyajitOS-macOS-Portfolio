import type { NotificationAction } from '@/stores/notifications'
import { useNotificationsStore } from '@/stores/notifications'
import { useWindowsStore } from '@/stores/windows'

/** What happens when a notification (or one of its buttons) is clicked. */
export function useNotificationActions() {
  const notifications = useNotificationsStore()
  const windows = useWindowsStore()

  function act(id: string, action?: NotificationAction) {
    if (action?.openApp) windows.open(action.openApp)
    action?.run?.()
    notifications.dismissBanner(id)
  }

  return { act, dismiss: notifications.dismissBanner, remove: notifications.remove }
}
