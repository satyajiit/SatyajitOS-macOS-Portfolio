import type { BrandName } from '@/ui/brand/registry'
import type { GlyphName } from '@/ui/glyphs/registry'

/**
 * About Me: everything the About app shows, on both the Mac and the phone.
 * Name, role, location, links and photo come from ./profile.ts.
 */

/** Icon keys map to SF Symbol stand-ins inside the app (see apps/about/icons.ts). */
export type AboutIcon =
  'rocket' | 'trophy' | 'gem' | 'award' | 'hammer' | 'star' | 'zap' | 'chart' | 'dollar'

export interface TechItem {
  label: string
  brand?: BrandName
}

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
  icon: GlyphName
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
  { title: '4.8:star: Rating', detail: 'App Store', icon: 'star', tint: 'pink' },
]

export const metrics: Metric[] = [
  { value: '50K+', label: 'Merchants Onboarded' },
  { value: '4.8:star:', label: 'App Store Rating' },
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

/** Brand logos come from svgl (see src/ui/brand); items without one show a generic glyph. */
export const techStack = {
  languages: {
    title: 'Languages & Frameworks',
    items: [
      { label: 'TypeScript', brand: 'typescript' },
      { label: 'JavaScript', brand: 'javascript' },
      { label: 'Go', brand: 'go' },
      { label: 'Java', brand: 'java' },
      { label: 'Kotlin', brand: 'kotlin' },
      { label: 'Python', brand: 'python' },
      { label: 'Vue.js', brand: 'vue' },
      { label: 'React', brand: 'react' },
      { label: 'Next.js', brand: 'nextjs' },
      { label: 'Node.js', brand: 'nodejs' },
      { label: 'Express.js', brand: 'express' },
      { label: 'Flutter', brand: 'flutter' },
      { label: 'Android', brand: 'android' },
      { label: 'KMP', brand: 'kotlin' },
    ],
  },
  tools: {
    title: 'Databases & Tools',
    items: [
      { label: 'MySQL', brand: 'mysql' },
      { label: 'MongoDB', brand: 'mongodb' },
      { label: 'PostgreSQL', brand: 'postgresql' },
      { label: 'RealmDB' },
      { label: 'ObjectBox' },
      { label: 'Redis', brand: 'redis' },
      { label: 'Docker', brand: 'docker' },
      { label: 'Kubernetes', brand: 'kubernetes' },
      { label: 'Firebase', brand: 'firebase' },
      { label: 'GraphQL', brand: 'graphql' },
      { label: 'AWS', brand: 'aws' },
      { label: 'GCP', brand: 'google-cloud' },
      { label: 'Git', brand: 'git' },
      { label: 'Figma', brand: 'figma' },
      { label: 'Tailwind CSS', brand: 'tailwind' },
    ],
  },
} satisfies Record<string, { title: string; items: TechItem[] }>

export const funFacts: FunFact[] = [
  { icon: 'race-car', text: 'F1 junkie - building a watch face inspired by DRS zones soon' },
  { icon: 'robot', text: "Once tried teaching my smart fan to detect code bugs (it didn't go well)" },
  { icon: 'bento', text: 'My code commits usually spike after biryani' },
  { icon: 'coffee', text: 'Coffee consumption directly correlates with code quality' },
  { icon: 'rocket', text: 'Built ZyadaShop in 15-second store creation time (yes, really!)' },
  { icon: 'target', text: "Democratizing tech - if it doesn't scale, I probably won't sleep" },
]

export const philosophy = {
  quote: 'Move fast and make it readable',
  attribution: 'Personal Dev Philosophy',
}
