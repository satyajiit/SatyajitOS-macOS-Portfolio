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
  hint: `Hint: Try "${profile.username}" :wink:`,
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
    'Workspace secured! :lock:',
    'Your creativity is safe! :sparkles:',
    'No unauthorized browsing! :grin:',
    'Password protected genius zone! :brain:',
    'Locked and loaded! :rocket:',
  ],
}

export const sleep = {
  goingToSleep: 'Going to sleep... :sleepy:',
  title: `${site.osName} is sleeping...`,
  wakeHint: 'Click or press any key to wake',
  quips: [
    'Sweet dreams! :sleepy:',
    'Recharging creativity... :battery:',
    'Entering power save mode... :zzz:',
    'Dreaming of code... :thought:',
    'Hibernating like a pro... :bear:',
    "Catching some Z's... :sleepy:",
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
  refreshWarning: "Your browser is about to refresh. Don't panic! :grin:",
}

export const shutdown = {
  messages: [
    'Saving your brilliant ideas...',
    'Closing all applications...',
    `Shutting down ${site.osName}...`,
    'Almost done...',
    "Wait... you can't actually shut down a website! :grin:",
    'Nice try though! :wink:',
    'Returning to normal operation...',
  ],
  /** The last few messages linger so the joke lands. */
  stepMs: 1000,
  punchlineStepMs: 2000,
  punchlineFrom: 4,
  title: 'Shutting Down...',
  twistTitle: 'Wait, what?!',
  reveal: [
    ":thinking: Hold on... I'm a website!",
    ':idea: Websites can\'t actually be "shut down" by users!',
    ':grin: This is just a fun simulation!',
  ],
  surprise: [':party: Surprise! I\'m still here!', ":globe: You can't kill a website that easily!", ':cool: Thanks for playing along!'],
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
