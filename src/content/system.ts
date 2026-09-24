import { profile } from './profile'
import { site } from './site'

/**
 * Copy for the Mac shell's system moments: boot, lock, sleep, restart and
 * shut down, plus the fake hardware the menu bar reports on.
 */

export const boot = {
  /** Total time the startup bar takes to fill. */
  durationMs: 3200,
  /** Not shown on screen (a Mac boots silently); used as the progress bar's live label. */
  messages: ['Initializing creativity...', 'Loading systems...', 'Preparing workspace...', 'Almost ready...'],
}

export const lock = {
  password: profile.username,
  hint: `Hint: Try "${profile.username}" 😉`,
  maxAttempts: 3,
  /** Pause after too many wrong guesses, in ms. */
  cooldownMs: 3000,
  lockingMessage: 'Securing workspace...',
  welcomeBack: 'Welcome back!',
  wrongPassword: 'Incorrect password. Try again!',
  tooManyAttempts: 'Too many failed attempts!',
  tooManyAttemptsStatus: 'Too many failed attempts. System temporarily locked.',
  placeholder: 'Enter Password',
  quips: [
    'Workspace secured! 🔒',
    'Your creativity is safe! ✨',
    'No unauthorized browsing! 😄',
    'Password protected genius zone! 🧠',
    'Locked and loaded! 🚀',
  ],
}

export const sleep = {
  goingToSleep: 'Going to sleep... 😴',
  title: `${site.osName} is sleeping...`,
  wakeHint: 'Click or press any key to wake',
  quips: [
    'Sweet dreams! 😴',
    'Recharging creativity... 🔋',
    'Entering power save mode... 💤',
    'Dreaming of code... 💭',
    'Hibernating like a pro... 🐻',
    "Catching some Z's... 😪",
  ],
  wokeUp: (seconds: number) => `Good morning! You slept for ${seconds} seconds.`,
}

export const restart = {
  messages: [
    'Saving your awesome work...',
    'Closing all applications...',
    'Backing up your creativity...',
    'Preparing for restart...',
    `Restarting ${site.osName}...`,
    'Almost there...',
    'Welcome back!',
  ],
  stepMs: 800,
  almostDone: 'Almost done!',
  refreshWarning: "Your browser is about to refresh. Don't panic! 😄",
}

export const shutdown = {
  messages: [
    'Saving your brilliant ideas...',
    'Closing all applications...',
    `Shutting down ${site.osName}...`,
    'Almost done...',
    "Wait... you can't actually shut down a website! 😄",
    'Nice try though! 😉',
    'Returning to normal operation...',
  ],
  /** The last few messages linger so the joke lands. */
  stepMs: 1000,
  punchlineStepMs: 2000,
  punchlineFrom: 4,
  title: 'Shutting Down...',
  twistTitle: 'Wait, what?!',
  reveal: [
    "🤔 Hold on... I'm a website!",
    '💡 Websites can\'t actually be "shut down" by users!',
    '😄 This is just a fun simulation!',
  ],
  surprise: ['🎉 Surprise! I\'m still here!', "🌐 You can't kill a website that easily!", '😎 Thanks for playing along!'],
}

export interface WifiNetworkSeed {
  name: string
  signalStrength: number
  isSecure: boolean
}

export interface BluetoothDeviceSeed {
  name: string
  type: 'headphones' | 'mouse' | 'keyboard' | 'phone' | 'speaker' | 'unknown'
  batteryLevel?: number
}

export const hardware = {
  wifi: [
    { name: `${site.osName}-Network`, signalStrength: 3, isSecure: true },
    { name: 'CreativeSpace-5G', signalStrength: 2, isSecure: true },
    { name: 'DevCafe-Guest', signalStrength: 1, isSecure: false },
  ] satisfies WifiNetworkSeed[],
  bluetoothConnected: [
    { name: 'AirPods Pro', type: 'headphones', batteryLevel: 92 },
  ] satisfies BluetoothDeviceSeed[],
  bluetoothAvailable: [
    { name: 'Magic Mouse', type: 'mouse', batteryLevel: 45 },
    { name: 'iPhone 15 Pro', type: 'phone' },
  ] satisfies BluetoothDeviceSeed[],
  outputDevice: 'MacBook Pro Speakers',
  battery: { level: 87, timeRemaining: '4:32' },
}
