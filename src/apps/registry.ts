import type { Component } from 'vue'

import type { AppIconName } from '@/ui/app-icons'

import { useMailStore } from './mail/store'

/**
 * Every app the OS knows about, in dock order. Both shells (desktop and phone)
 * render from this list, so adding an app means adding one entry here and
 * dropping its components into src/apps/<id>/.
 */

export type AppId = 'about' | 'coffee' | 'email' | 'finder' | 'terminal' | 'settings'

/** Where the traffic lights sit: inside a 52px unified toolbar, or a 32px title bar. */
export type WindowChrome = 'toolbar' | 'titlebar'

export interface DesktopSpec {
  component: () => Promise<Component>
  title: string
  width: number
  height: number
  minWidth: number
  minHeight: number
  chrome: WindowChrome
  resizable?: boolean
  /**
   * The window frame is see-through so a translucent sidebar blurs the desktop
   * behind it (macOS "behind-window" vibrancy). The app must paint its own
   * content background.
   */
  vibrant?: boolean
}

export interface MobileSpec {
  component: () => Promise<Component>
  /** Label under the home-screen icon, when it differs from `name`. */
  label?: string
}

export interface AppDefinition {
  id: AppId
  /** Menu-bar and Dock name. */
  name: string
  icon: AppIconName
  description: string
  desktop?: DesktopSpec
  mobile?: MobileSpec
  /** Pinned in the macOS Dock. */
  dock?: boolean
  /** Shown as an icon on the macOS desktop. */
  desktopIcon?: boolean
  /** Pinned in the iPhone dock (max four). */
  mobileDock?: boolean
  /** Live badge count for the Dock / home screen. Call inside a component (uses stores). */
  badge?: () => number
}

export const apps: AppDefinition[] = [
  {
    id: 'about',
    name: 'About Me',
    icon: 'about',
    description: 'The human behind the OS',
    dock: true,
    desktopIcon: true,
    mobileDock: true,
    desktop: {
      component: () => import('./about/AboutDesktop.vue'),
      title: 'About This Human',
      width: 560,
      height: 520,
      minWidth: 480,
      minHeight: 440,
      chrome: 'titlebar',
    },
    mobile: { component: () => import('./about/AboutMobile.vue') },
  },
  {
    id: 'coffee',
    name: 'Coffee Chat',
    icon: 'coffee',
    description: 'Book a virtual coffee',
    dock: true,
    desktopIcon: true,
    mobileDock: true,
    desktop: {
      component: () => import('./coffee/CoffeeDesktop.vue'),
      title: 'Coffee Chat',
      width: 640,
      height: 560,
      minWidth: 520,
      minHeight: 440,
      chrome: 'toolbar',
    },
    mobile: { component: () => import('./coffee/CoffeeMobile.vue') },
  },
  {
    id: 'email',
    name: 'Mail',
    icon: 'mail',
    description: 'An inbox full of totally real emails',
    badge: () => useMailStore().unreadCount,
    dock: true,
    desktopIcon: true,
    mobileDock: true,
    desktop: {
      component: () => import('./mail/MailDesktop.vue'),
      title: 'Mail',
      vibrant: true,
      width: 1040,
      height: 620,
      minWidth: 760,
      minHeight: 440,
      chrome: 'toolbar',
    },
    mobile: { component: () => import('./mail/MailMobile.vue') },
  },
  {
    id: 'finder',
    name: 'Finder',
    icon: 'finder',
    description: 'Browse my digital life',
    dock: true,
    desktopIcon: true,
    mobileDock: true,
    desktop: {
      component: () => import('./finder/FinderDesktop.vue'),
      title: 'Finder',
      vibrant: true,
      width: 960,
      height: 600,
      minWidth: 720,
      minHeight: 420,
      chrome: 'toolbar',
    },
    mobile: { component: () => import('./finder/FinderMobile.vue'), label: 'Files' },
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: 'terminal',
    description: 'Type `help`. Then type `sudo`. See what happens.',
    dock: true,
    desktopIcon: true,
    desktop: {
      component: () => import('./terminal/TerminalDesktop.vue'),
      title: 'satyajit — zsh — 80×24',
      width: 720,
      height: 460,
      minWidth: 520,
      minHeight: 320,
      chrome: 'titlebar',
    },
    mobile: { component: () => import('./terminal/TerminalMobile.vue'), label: 'Termux' },
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: 'settings',
    description: 'Appearance, accent colour, and the PWA',
    mobile: { component: () => import('./settings/SettingsMobile.vue') },
  },
]

const byId = new Map(apps.map((app) => [app.id, app]))

export function getApp(id: string): AppDefinition | undefined {
  return byId.get(id as AppId)
}

export function isAppId(id: unknown): id is AppId {
  return typeof id === 'string' && byId.has(id as AppId)
}

export const desktopApps = apps.filter((app) => app.desktop)
export const mobileApps = apps.filter((app) => app.mobile)
