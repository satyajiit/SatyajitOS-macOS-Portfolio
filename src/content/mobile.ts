import type { AppId } from '@/apps/registry'

import { site } from './site'

/**
 * Everything the iPhone shell says: boot lines, seed notifications, Control
 * Centre banter and Settings copy. Tables keyed by `below` are read with
 * `pickBelow()`: the first row whose `below` is greater than the value wins.
 */

export interface Threshold<T = string> {
  below: number
  value: T
}

export function pickBelow<T>(table: Threshold<T>[], level: number): T {
  return (table.find((row) => level < row.below) ?? table[table.length - 1]!).value
}

export function pickRandom<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]!
}

/* ── Boot ─────────────────────────────────────────────────────────────── */

export const boot = {
  durationMs: 2500,
  messages: ['Initializing creativity...', 'Loading systems...', 'Preparing workspace...', 'Almost ready...'],
}

/* ── Notifications ────────────────────────────────────────────────────── */

export interface SeedNotification {
  title: string
  body: string
  app?: AppId
  minutesAgo: number
}

/** Filed quietly into Notification Centre on first boot, oldest last. */
export const seedNotifications: SeedNotification[] = [
  {
    title: 'Welcome to SatyajitOS',
    body: 'Your innovative mobile experience starts here! :rocket:',
    minutesAgo: 2,
  },
  {
    title: 'Coffee Break Reminder',
    body: 'Time for some virtual coffee! :coffee: (Still working on real coffee delivery)',
    app: 'coffee',
    minutesAgo: 5,
  },
  {
    title: 'System Update',
    body: 'Innovation level increased by 42%! :trending:',
    app: 'settings',
    minutesAgo: 10,
  },
  {
    title: 'Portfolio Achievement Unlocked! :trophy:',
    body: "You've successfully created both desktop AND mobile versions! The multiverse is impressed. :galaxy:",
    minutesAgo: 15,
  },
]

/** The banner that drops in a few seconds after the home screen appears. */
export const welcomeBanner = {
  delayMs: 3000,
  title: 'Welcome to SatyajitOS',
  body: 'Your iOS portfolio is ready! Swipe down from the top to see notifications.',
}

export const updateNotification = {
  title: 'Software Update',
  body: 'A new version of SatyajitOS is ready. Tap to restart into it.',
  action: 'Update Now',
}

export const notificationCentre = {
  subtitles: [
    'Your digital doorbell',
    'Interruptions, but make them pretty',
    'The attention economy at work',
    "Ping! You've got... stuff",
    "Your pocket's way of saying hello",
    'Digital breadcrumbs from the void',
    'The modern smoke signal',
  ],
  emptyMessages: [
    'Enjoy the silence while it lasts!',
    'Your phone is taking a break from bothering you.',
    'Blessed emptiness. Savor this moment.',
    'No pings, no dings, just zen.',
    'The notification gods are sleeping.',
    'Peace at last! (Until the next ping)',
    'Your attention span thanks you.',
  ],
  dismissLabels: [
    'Dismiss (begone!)',
    'Delete this interruption',
    'Make it disappear',
    'Send to the void',
    'Not today, notification!',
  ],
  /** Posted after tapping a notification that doesn't belong to an app. */
  tapReplies: [
    'Notification acknowledged! :phone:',
    'Message received loud and clear! :megaphone:',
    'Tapping into the notification matrix... :crystal-ball:',
    'Notification processed successfully! :done:',
    "You've been notified that you clicked a notification! :mind-blown:",
  ],
  tapReplyTitle: 'Notification System',
  demos: [
    {
      title: 'Innovation Alert! :rocket:',
      body: 'New breakthrough idea detected in your brain! Patent pending...',
      app: 'settings',
    },
    {
      title: 'Coffee Status Update :coffee:',
      body: 'Caffeine levels critically low. Productivity may suffer!',
      app: 'coffee',
    },
    { title: 'Genius Mode Activated :brain:', body: 'Your IQ just increased by 42 points! (Results may vary)' },
    { title: 'Time Travel Request :clock:', body: 'Someone wants to borrow your DeLorean. Again.' },
    { title: 'Motivation Boost :strong:', body: "You're doing amazing! Keep being awesome!" },
  ] as { title: string; body: string; app?: AppId }[],
  markedRead: {
    title: 'Notification Center',
    body: 'All notifications marked as read! Your inbox is now zen. :zen:',
  },
  snoozed: {
    title: 'Snooze Master',
    body: (count: number) => `Snoozed ${count} notifications. They'll be back... eventually. :sleepy:`,
  },
  mood: [
    { below: 1, value: { emoji: ':smile:', hint: 'Zen master level achieved' } },
    { below: 3, value: { emoji: ':smile:', hint: 'Manageable chaos' } },
    { below: 6, value: { emoji: ':meh:', hint: 'Getting a bit crowded' } },
    { below: 11, value: { emoji: ':anxious:', hint: 'Notification overload incoming' } },
    { below: Infinity, value: { emoji: ':mind-blown:', hint: 'Digital avalanche detected!' } },
  ] as Threshold<{ emoji: string; hint: string }>[],
  distraction: [
    { below: 1, value: { level: 'Minimal', hint: 'Focus mode: activated' } },
    { below: 3, value: { level: 'Low', hint: 'Still manageable' } },
    { below: 6, value: { level: 'Medium', hint: 'Attention divided' } },
    { below: 11, value: { level: 'High', hint: 'Squirrel! What were we doing?' } },
    { below: Infinity, value: { level: 'MAXIMUM', hint: 'RIP productivity' } },
  ] as Threshold<{ level: string; hint: string }>[],
}

/* ── Control Centre ───────────────────────────────────────────────────── */

export const controlCentre = {
  subtitles: [
    'Controlling your digital destiny',
    'Where mobile magic happens (allegedly)',
    'Your pocket command center',
    'Making phones do phone things',
    'The swipes that matter',
    'Adjusting reality, one tap at a time',
    "Because you're the boss here",
    'Fine-tuning your mobile experience',
    "Satyajit's innovation playground",
    'Breaking things to make them better',
  ],
  brightness: {
    label: [
      { below: 20, value: 'Vampire Mode' },
      { below: 40, value: 'Cozy' },
      { below: 60, value: 'Just Right' },
      { below: 80, value: 'Energized' },
      { below: Infinity, value: 'Solar Panel Mode' },
    ] as Threshold[],
    hint: [
      { below: 20, value: 'Perfect for midnight scrolling' },
      { below: 40, value: 'Easy on the eyes' },
      { below: 60, value: 'Goldilocks approved' },
      { below: 80, value: 'Productivity mode activated' },
      { below: Infinity, value: 'Warning: May cause temporary blindness' },
    ] as Threshold[],
    /** Replaces the percentage at the extremes. */
    reading: (level: number) =>
      level === 0 ? ':moon:' : level === 100 ? ':sun:' : level < 30 ? ':moon:' : `${Math.round(level)}%`,
  },
  volume: {
    label: [
      { below: 1, value: 'Silent Mode' },
      { below: 20, value: 'Library Mode' },
      { below: 50, value: 'Indoor Voice' },
      { below: 80, value: 'Confident' },
      { below: Infinity, value: 'Party Mode! :party:' },
    ] as Threshold[],
    hint: [
      { below: 1, value: 'Shh... ninja mode activated' },
      { below: 30, value: 'Perfect for late-night coding' },
      { below: 70, value: 'Just right for focus' },
      { below: 90, value: 'Getting spicy! :spicy:' },
      { below: Infinity, value: 'RIP AirPods users' },
    ] as Threshold[],
    reading: (level: number) => (level === 0 ? ':mute:' : level === 100 ? ':hundred:' : `${Math.round(level)}%`),
  },
  /** The second page of modules: the ones Apple forgot to ship. */
  extras: {
    title: "Satyajit's Controls",
    productivity: {
      label: 'Productivity Level',
      emoji: [
        { below: 20, value: ':sleepy:' },
        { below: 40, value: ':snail:' },
        { below: 60, value: ':walk:' },
        { below: 80, value: ':run:' },
        { below: Infinity, value: ':rocket:' },
      ] as Threshold[],
      hint: [
        { below: 20, value: "Maybe it's nap time?" },
        { below: 40, value: 'Slow and steady wins' },
        { below: 60, value: 'Getting warmed up' },
        { below: 80, value: "Now we're cooking!" },
        { below: Infinity, value: 'MAXIMUM OVERDRIVE!' },
      ] as Threshold[],
    },
    caffeine: {
      label: 'Caffeine Level',
      emoji: [
        { below: 20, value: ':dizzy-face:' },
        { below: 40, value: ':sleepy:' },
        { below: 60, value: ':meh:' },
        { below: 80, value: ':smile:' },
        { below: Infinity, value: ':mind-blown:' },
      ] as Threshold[],
      hint: [
        { below: 20, value: 'Emergency coffee required!' },
        { below: 40, value: 'Time for a coffee break' },
        { below: 60, value: 'Adequately caffeinated' },
        { below: 80, value: 'Feeling the buzz' },
        { below: Infinity, value: 'Warning: May cause spontaneous coding' },
      ] as Threshold[],
    },
    codeQuality: {
      label: 'Code Quality',
      emoji: [
        { below: 20, value: ':poop:' },
        { below: 40, value: ':thinking:' },
        { below: 60, value: ':thumbs-up:' },
        { below: 80, value: ':sparkles:' },
        { below: Infinity, value: ':trophy:' },
      ] as Threshold[],
      hint: [
        { below: 20, value: 'Time to refactor... everything' },
        { below: 40, value: 'It works, but at what cost?' },
        { below: 60, value: 'Decent code, decent life' },
        { below: 80, value: 'Clean code enthusiast detected' },
        { below: Infinity, value: 'Code so beautiful it makes angels weep' },
      ] as Threshold[],
    },
    procrastination: {
      label: 'Procrastination Blocker',
      on: "Social media blocked. You're welcome, future you.",
      off: 'Procrastination mode: fully operational.',
    },
    innovation: {
      label: 'Innovation Mode',
      onState: 'Innovating',
      offState: 'Standard',
      on: 'Breaking things to make them better. Classic Satyajit move.',
      off: 'Playing it safe... for now.',
    },
  },
}

/* ── Settings ─────────────────────────────────────────────────────────── */

export const settings = {
  version: site.version,
  profileSubtitle: 'Portfolio, Contact & more',
  deviceName: "Satyajit's iPhone",
  sourceUrl: site.sourceUrl,
  builtWith: ['Vue 3', 'Vite', 'Pinia', 'Tailwind CSS', 'motion-v'],
  developerSubtitle: 'Advanced settings for developers',
  upToDate: 'SatyajitOS is up to date',
  updateAvailable: 'Update available',
  checking: 'Checking for Update…',
  networks: [
    { name: 'SatyajitOS Network', bars: 3, secure: true },
    { name: 'CreativeSpace-5G', bars: 2, secure: true },
    { name: 'DevCafe-Guest', bars: 1, secure: false },
  ],
  bluetoothDevices: [
    { name: 'AirPods Pro', connected: true },
    { name: 'Magic Mouse', connected: false },
    { name: 'iPhone 15 Pro', connected: false },
  ],
  addToHomeScreen: {
    intro: 'Install SatyajitOS like a real app: full screen, its own icon, works offline.',
    steps: [
      'Open this page in Safari.',
      'Tap the Share button in the toolbar.',
      'Scroll down and tap “Add to Home Screen”.',
      'Tap Add. SatyajitOS is now on your Home Screen.',
    ],
    installed: 'SatyajitOS is already installed on this device.',
    installButton: 'Install SatyajitOS',
  },
}
