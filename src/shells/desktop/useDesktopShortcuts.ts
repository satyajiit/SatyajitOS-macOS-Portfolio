import { useEventListener } from '@vueuse/core'

import { useSystemStore } from '@/stores/system'
import { useWindowsStore } from '@/stores/windows'

import { closeMenus, shellUi } from './shellUi'

/**
 * Keyboard shortcuts the menu bar advertises. Some (⌘W, ⌘M, ⌃⌘Q) are
 * reserved by the browser or macOS itself, so they only work where the
 * browser lets the page see them; the menu items always work.
 */
export function useDesktopShortcuts() {
  const windows = useWindowsStore()
  const system = useSystemStore()

  useEventListener(window, 'keydown', (event: KeyboardEvent) => {
    if (!system.isNormal) return
    const mod = event.metaKey || event.ctrlKey
    const key = event.key.toLowerCase()

    if (event.key === 'Escape' && shellUi.openMenu) {
      closeMenus()
      return
    }
    if (event.metaKey && event.ctrlKey && key === 'q') {
      event.preventDefault()
      void system.lockScreen()
      return
    }
    if (!mod || event.altKey || event.shiftKey) return

    const id = windows.focusedId
    if (key === 'w' && id) {
      event.preventDefault()
      windows.close(id)
    } else if (key === 'm' && id) {
      event.preventDefault()
      windows.minimize(id)
    }
  })
}
