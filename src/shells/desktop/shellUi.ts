import { reactive } from 'vue'

import type { AppId } from '@/apps/registry'

/**
 * Transient UI state shared across the Mac shell: which menu or panel is
 * open, desktop icon selection, and a couple of view toggles.
 */
export type PanelId = 'control-center' | 'notification-center'

export const shellUi = reactive({
  /** The Mac boots once per page load, even if the shell re-mounts (e.g. after a resize). */
  booted: false,
  /** The welcome notifications have been posted this session. */
  welcomed: false,
  /** A menu-bar menu id, a status menu id, or a panel id. */
  openMenu: null as string | null,
  /** The menu was opened from the keyboard, so its first item takes focus. */
  openedWithKeyboard: false,
  installDialog: false,
  selectedIcon: null as AppId | null,
  showWidgets: true,
})

export function closeMenus() {
  shellUi.openMenu = null
  shellUi.openedWithKeyboard = false
}

export function togglePanel(id: PanelId) {
  shellUi.openMenu = shellUi.openMenu === id ? null : id
  shellUi.openedWithKeyboard = false
}
