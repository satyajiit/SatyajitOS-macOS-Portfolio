/**
 * Site-level identity. Plain data with no Vue imports, because vite.config.ts
 * reads it to build the PWA manifest.
 *
 * Forking this? Change these values first, then the rest of src/content/.
 */
export const site = {
  /** Shown in the menu bar, boot screen and PWA install prompt. */
  osName: 'SatyajitOS',
  /** Bold part of the OS name in the menu bar (the rest renders regular). */
  osNameBoldSuffix: 'OS',
  title: 'Satyajit Pradhan — Product + Tech Alchemist | SatyajitOS',
  description:
    'A macOS & iOS inspired interactive portfolio. Boot it up, drag the windows around, poke the Terminal, read the (very real) inbox.',
  keywords: [
    'Satyajit Pradhan',
    'SatyajitOS',
    'macOS portfolio',
    'interactive portfolio',
    'web desktop',
    'Vue portfolio',
    'PWA',
  ],
  /** Brand tint used for the browser UI and splash screens. */
  themeColor: '#000000',
  backgroundColor: '#000000',
  /** Shown in About / Software Update. */
  version: '2.0',
  sourceUrl: 'https://github.com/satyajiit/SatyajitOS-macOS-Portfolio',
  locale: 'en_US',
  twitterHandle: '@satyajiit',
} as const

export type Site = typeof site
