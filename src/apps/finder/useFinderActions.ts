import { finderCopy } from '@/content/files'
import { useNotificationsStore } from '@/stores/notifications'

import { fill, type Item } from './fs'

// Once per page load: the jokes are funny the first time, not the fifth.
const greeted = { welcome: false }
const openedFolders = new Set<string>()

function randomOf<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]!
}

/** Side effects shared by Finder and Files: notifications, clipboard, share. */
export function useFinderActions() {
  const notifications = useNotificationsStore()
  const post = (title: string, body: string, kind: 'info' | 'success' = 'info') =>
    notifications.notify({ title, body, app: 'finder', kind, duration: 3500 })

  return {
    welcome() {
      if (greeted.welcome) return
      greeted.welcome = true
      post('Welcome to Finder', randomOf(finderCopy.welcome), 'success')
    },

    folderOpened(id: string) {
      const message = finderCopy.folderOpened[id]
      if (!message || openedFolders.has(id)) return
      openedFolders.add(id)
      post('Folder Opened', message)
    },

    newFolder: () => post('New Folder', finderCopy.actions.newFolder, 'success'),
    refreshed: () => post('Refreshed', finderCopy.actions.refreshed),
    hiddenFiles: () => post('Show Hidden Files', finderCopy.actions.hidden),
    procrastinate: () => post('Action Executed', finderCopy.actions.procrastinate),
    blameIntern: () => post('Action Executed', finderCopy.actions.blameIntern),
    coffeeBreak: () => post('Action Executed', finderCopy.actions.coffeeBreak),
    panic: () => post('Action Executed', finderCopy.actions.panic),

    blameSomeone() {
      post(
        'Blame Successfully Assigned',
        `This error is definitely the fault of ${randomOf(finderCopy.blameTargets)}! :target:`,
        'success',
      )
    },

    async share(item: Item) {
      const text = `${item.name}: ${item.description ?? item.tooltip ?? 'a file from SatyajitOS'}`
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({ title: item.name, text, url: window.location.href })
          return
        } catch {
          // Cancelled or blocked: fall through to the in-OS confirmation.
        }
      }
      post('Story Shared', fill(finderCopy.actions.shared, { name: item.name }), 'success')
    },

    /** Copies the file name, silently, like ⌘C on a file. */
    async copyName(item: Item) {
      try {
        await navigator.clipboard.writeText(item.name)
      } catch {
        // Clipboard permission denied; nothing useful to tell the user.
      }
    },

    searchQuip: (query: string) => fill(randomOf(finderCopy.search), { q: query }),
  }
}
