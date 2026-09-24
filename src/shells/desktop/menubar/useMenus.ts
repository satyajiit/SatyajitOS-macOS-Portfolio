import { useFullscreen } from '@vueuse/core'
import { computed } from 'vue'

import { getApp, type AppId } from '@/apps/registry'
import { menuBarCopy, pwaCopy } from '@/content/desktop'
import { site } from '@/content/site'
import { usePwaInstall } from '@/composables/usePwaInstall'
import { useAppearanceStore } from '@/stores/appearance'
import { useNotificationsStore } from '@/stores/notifications'
import { useSystemStore } from '@/stores/system'
import { useWindowsStore } from '@/stores/windows'

import { shellUi } from '../shellUi'
import type { MenuEntry, TopMenu } from './types'

const separator: MenuEntry = { kind: 'separator' }

const openUrl = (url: string) => window.open(url, '_blank', 'noopener,noreferrer')


/** The menu bar's contents, rebuilt whenever the key window changes. */
export function useMenus() {
  const windows = useWindowsStore()
  const system = useSystemStore()
  const appearance = useAppearanceStore()
  const notifications = useNotificationsStore()
  const pwa = usePwaInstall()
  const fullscreen = useFullscreen()

  const focused = computed(() => (windows.focusedId ? getApp(windows.focusedId) : undefined))
  const appName = computed(() => focused.value?.name ?? menuBarCopy.noApp)

  const aboutApp = () => {
    if (focused.value?.id === 'about' || !focused.value) {
      windows.open('about')
      return
    }
    notifications.notify({
      title: menuBarCopy.aboutApp(appName.value),
      body: menuBarCopy.aboutAppJoke(appName.value),
      app: focused.value.id,
    })
  }

  const withFocused = (fn: (id: AppId) => void) => () => {
    if (windows.focusedId) fn(windows.focusedId)
  }

  const menus = computed<TopMenu[]>(() => {
    const hasKey = !!windows.focusedId
    const open = windows.openWindows

    return [
      {
        id: 'brand',
        label: site.osName,
        brand: true,
        entries: [
          { label: menuBarCopy.aboutOs, action: () => windows.open('about') },
          separator,
          ...(pwa.isInstalled.value
            ? []
            : [{ label: pwaCopy.menuItem, action: () => (shellUi.installDialog = true) }, separator]),
          { label: 'Sleep', action: () => void system.sleep() },
          { label: 'Restart…', action: () => void system.restart() },
          { label: 'Shut Down…', action: () => void system.shutdown() },
          separator,
          { label: 'Lock Screen', shortcut: '⌃⌘Q', action: () => void system.lockScreen() },
        ],
      },
      {
        id: 'app',
        label: appName.value,
        bold: true,
        entries: [
          { label: menuBarCopy.aboutApp(appName.value), action: aboutApp },
          separator,
          {
            label: `Hide ${appName.value}`,
            shortcut: '⌘H',
            disabled: !hasKey,
            action: withFocused(windows.minimize),
          },
          {
            label: `Quit ${appName.value}`,
            shortcut: '⌘Q',
            disabled: !hasKey,
            action: withFocused(windows.close),
          },
        ],
      },
      {
        id: 'file',
        label: 'File',
        entries: [
          { label: 'New Finder Window', shortcut: '⌘N', action: () => windows.open('finder') },
          { label: 'New Terminal Window', shortcut: '⌥⌘N', action: () => windows.open('terminal') },
          separator,
          {
            label: 'Close Window',
            shortcut: '⌘W',
            disabled: !hasKey,
            action: withFocused(windows.close),
          },
        ],
      },
      {
        id: 'edit',
        label: 'Edit',
        entries: [
          { label: 'Undo', shortcut: '⌘Z', disabled: true },
          { label: 'Redo', shortcut: '⇧⌘Z', disabled: true },
          separator,
          { label: 'Cut', shortcut: '⌘X', disabled: true },
          { label: 'Copy', shortcut: '⌘C', action: () => document.execCommand('copy') },
          { label: 'Paste', shortcut: '⌘V', disabled: true },
          { label: 'Select All', shortcut: '⌘A', action: () => document.execCommand('selectAll') },
        ],
      },
      {
        id: 'view',
        label: 'View',
        entries: [
          {
            label: appearance.isDark ? 'Exit Dark Mode' : 'Enter Dark Mode',
            action: appearance.toggleDark,
          },
          {
            label: 'Show Desktop Widgets',
            checked: shellUi.showWidgets,
            action: () => (shellUi.showWidgets = !shellUi.showWidgets),
          },
          separator,
          {
            label: fullscreen.isFullscreen.value ? 'Exit Full Screen' : 'Enter Full Screen',
            shortcut: '⌃⌘F',
            disabled: !fullscreen.isSupported.value,
            action: () => void fullscreen.toggle(),
          },
        ],
      },
      {
        id: 'window',
        label: 'Window',
        entries: [
          {
            label: 'Minimize',
            shortcut: '⌘M',
            disabled: !hasKey,
            action: withFocused(windows.minimize),
          },
          { label: 'Zoom', disabled: !hasKey, action: withFocused(windows.toggleZoom) },
          separator,
          {
            label: 'Bring All to Front',
            disabled: open.length === 0,
            action: () => {
              for (const w of [...open].sort((a, b) => a.zIndex - b.zIndex)) windows.open(w.id)
            },
          },
          ...(open.length ? [separator] : []),
          ...open.map((w) => ({
            label: getApp(w.id)?.desktop?.title ?? w.id,
            checked: windows.focusedId === w.id,
            action: () => windows.open(w.id),
          })),
        ],
      },
      {
        id: 'help',
        label: 'Help',
        entries: [
          { label: `${site.osName} Help`, action: () => windows.open('about') },
          separator,
          { label: 'View Source on GitHub', action: () => openUrl(menuBarCopy.sourceUrl) },
          { label: 'Report an Issue…', action: () => openUrl(menuBarCopy.issuesUrl) },
        ],
      },
    ]
  })

  return { menus, appName }
}
