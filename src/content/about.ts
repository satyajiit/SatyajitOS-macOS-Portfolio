/**
 * About Me: everything the About app shows, on both the Mac and the phone.
 * Name, role, location, links and photo come from ./profile.ts.
 */

/** Icon keys map to SF Symbol stand-ins inside the app (see apps/about/icons.ts). */
export type AboutIcon =
  'rocket' | 'trophy' | 'gem' | 'award' | 'hammer' | 'star' | 'zap' | 'chart' | 'dollar'

export interface Spec {
  label: string
  /** `uptime` and `location` are filled in live by the app. */
  value: string | 'uptime' | 'location'
  mono?: boolean
}

export interface Highlight {
  title: string
  detail: string
  icon: AboutIcon
  /** A system colour token name, e.g. 'orange' → var(--sys-orange). */
  tint: 'orange' | 'yellow' | 'blue' | 'purple' | 'green' | 'mint' | 'pink' | 'indigo'
}

export interface Metric {
  value: string
  label: string
}

export interface FunFact {
  emoji: string
  text: string
}

/** Uptime counts from here: roughly when the coding started. */
export const codingSince = '2018-01-01'

export const taglines = ['Coffee-Fueled Coder', 'Product Wizard', 'YC 22 Finalist']

export const mottos = [
  "I don't just write code, I birth digital babies",
  'Product creation is my love language',
]

/** "About This Mac", but for a human. */
export const systemInfo: Spec[] = [
  { label: 'OS', value: 'SatyajitOS v2.5.1' },
  { label: 'Kernel', value: 'Entrepreneur-Core' },
  { label: 'Uptime', value: 'uptime', mono: true },
  { label: 'Location', value: 'location' },
  { label: 'CPU', value: 'Innovation-8000X' },
  { label: 'Memory', value: '∞ GB Ideas' },
  { label: 'Storage', value: '1TB+ Experience' },
  { label: 'Network', value: 'Connected' },
]

export const status = {
  title: 'Currently online',
  detail: 'Active & Available',
  updatedLabel: 'Last updated',
}

export const currentRole = {
  note: 'Building the future',
  subnote: 'One line at a time',
}

/** "Achievement Unlocked" badges. */
export const highlights: Highlight[] = [
  { title: 'YC 22 Finalist', detail: 'Top 1% globally', icon: 'rocket', tint: 'orange' },
  { title: '8 Digit Exit', detail: 'ZyadaShop sold', icon: 'trophy', tint: 'yellow' },
  { title: 'Hidden Gem', detail: 'Google Play Store', icon: 'gem', tint: 'blue' },
  { title: 'AppScale Academy', detail: 'Google certified', icon: 'award', tint: 'purple' },
  { title: 'Product Builder', detail: 'Love creating solutions', icon: 'hammer', tint: 'green' },
  { title: '4.8★ Rating', detail: 'App Store', icon: 'star', tint: 'pink' },
]

export const metrics: Metric[] = [
  { value: '50K+', label: 'Merchants Onboarded' },
  { value: '4.8★', label: 'App Store Rating' },
  { value: '∞', label: 'Coffee Cups' },
  { value: '99.9%', label: 'Uptime' },
]

export const milestones: Highlight[] = [
  {
    title: 'YC 22 Finalist',
    detail: 'Selected among top startups globally',
    icon: 'rocket',
    tint: 'orange',
  },
  {
    title: '8-Figure Exit',
    detail: 'ZyadaShop acquisition success',
    icon: 'trophy',
    tint: 'yellow',
  },
  {
    title: '15-Second Store Creation',
    detail: 'Revolutionary e-commerce speed',
    icon: 'zap',
    tint: 'blue',
  },
  {
    title: 'Product Leadership',
    detail: 'Head of Product at Mosambee',
    icon: 'star',
    tint: 'purple',
  },
  {
    title: 'Tech Innovation',
    detail: 'Multiple successful product launches',
    icon: 'chart',
    tint: 'green',
  },
  {
    title: 'Revenue Impact',
    detail: 'Millions in revenue generated',
    icon: 'dollar',
    tint: 'mint',
  },
]

export const techStack = {
  languages: {
    title: 'Languages & Frameworks',
    items: [
      'TypeScript',
      'JavaScript',
      'Go',
      'Java',
      'Kotlin',
      'Python',
      'Vue.js',
      'React',
      'Next.js',
      'Node.js',
      'Express.js',
      'Flutter',
      'Android',
      'KMP',
    ],
  },
  tools: {
    title: 'Databases & Tools',
    items: [
      'MySQL',
      'MongoDB',
      'PostgreSQL',
      'RealmDB',
      'ObjectBox',
      'Redis',
      'Docker',
      'Kubernetes',
      'Firebase',
      'GraphQL',
      'AWS',
      'GCP',
      'Git',
      'Figma',
      'Tailwind CSS',
    ],
  },
}

export const funFacts: FunFact[] = [
  { emoji: '🏎️', text: 'F1 junkie - building a watch face inspired by DRS zones soon' },
  { emoji: '🤖', text: "Once tried teaching my smart fan to detect code bugs (it didn't go well)" },
  { emoji: '🍱', text: 'My code commits usually spike after biryani' },
  { emoji: '☕', text: 'Coffee consumption directly correlates with code quality' },
  { emoji: '🚀', text: 'Built ZyadaShop in 15-second store creation time (yes, really!)' },
  { emoji: '🎯', text: "Democratizing tech - if it doesn't scale, I probably won't sleep" },
]

export const philosophy = {
  quote: 'Move fast and make it readable',
  attribution: 'Personal Dev Philosophy',
}
