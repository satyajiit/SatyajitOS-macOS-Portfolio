import type { AppId } from '@/apps/registry'

import { site } from './site'

/** Copy that only the Mac shell uses. */

export interface WelcomeNotification {
  delayMs: number
  title: string
  body: string
  app?: AppId
  kind?: 'info' | 'success'
  durationMs: number
  action?: { label: string; openApp: AppId }
}

/** Posted once, shortly after the desktop appears. */
export const welcomeNotifications: WelcomeNotification[] = [
  {
    delayMs: 1000,
    title: `Welcome to ${site.osName}`,
    body: 'System ready for innovation',
    kind: 'success',
    durationMs: 5000,
    action: { label: 'Explore', openApp: 'about' },
  },
  {
    delayMs: 3000,
    title: 'Coffee Status',
    body: 'Optimal caffeine levels detected',
    app: 'coffee',
    durationMs: 4000,
  },
  {
    delayMs: 5000,
    title: 'System Status',
    body: 'All systems operational. Ready for creative work!',
    durationMs: 6000,
  },
]

export const pwaCopy = {
  menuItem: `Install ${site.osName}…`,
  titles: [
    `Install ${site.osName}?`,
    'Ready to upgrade your device?',
    'Join the Human.exe revolution?',
    'Install this masterpiece?',
    'Add to your digital arsenal?',
    'Ready for the full experience?',
  ],
  messages: [
    `:rocket: Ready to take ${site.osName} for a spin?`,
    ':sparkle: Transform your device into a productivity powerhouse!',
    ':target: Install now and join the elite Human.exe users!',
    ':zap: Warning: May cause excessive productivity and startup FOMO',
    `:fire: Get the full ${site.osName} experience on your home screen!`,
    ':palette: Your device deserves this level of awesomeness',
    ':gem: Upgrade your digital life with one click!',
  ],
  perks: ['Works offline', 'Fast loading', 'Home screen'],
  installed: { title: 'Installed :check:', body: `${site.osName} now lives next to your real apps.` },
  update: {
    title: 'Update Available',
    body: `A new version of ${site.osName} is available with the latest features and improvements.`,
    action: 'Update',
  },
  offlineReady: { title: 'Ready offline', body: `${site.osName} now works without a connection.` },
}

/** Clicking the Trash in the Dock. */
export const trashJokes = [
  'Trash is empty. Unlike my browser tabs.',
  'Nothing in here. I ship my mistakes to production instead.',
  'Empty. All the bad ideas were already pivoted into features.',
  'Trash is empty. The legacy code got a proper farewell.',
]

export const menuBarCopy = {
  aboutOs: `About ${site.osName}`,
  sourceUrl: site.sourceUrl,
  issuesUrl: `${site.sourceUrl}/issues`,
  noApp: 'Finder',
  aboutApp: (name: string) => `About ${name}`,
  aboutAppJoke: (name: string) => `${name} was made with coffee and questionable sleep hours.`,
}
