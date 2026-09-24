/**
 * Coffee Chat: the booking app. Topics, the coffee personality test, the form
 * copy and every notification it can post. Contact links come from ./profile.ts.
 */

import type { GlyphName } from '@/ui/glyphs/registry'

export interface Topic {
  id: string
  icon: GlyphName
  title: string
  description: string
  tags: string[]
}

export interface CoffeeType {
  id: string
  name: string
  icon: GlyphName
  personality: string
  /** Shown once picked. */
  analysis: string
  /** Confirmation line when a chat is booked by someone who picked this. */
  booked: string
}

export interface MeetingType {
  id: 'video' | 'phone' | 'in-person' | 'async'
  label: string
  icon: GlyphName
}

export const intro = {
  title: "Let's Grab Coffee & Build Something Cool",
  body: "I love turning wild ideas into reality over a perfectly brewed cup! Let's chat about your next big thing.",
}

/** The capsule machine that brews a cup every time the app opens. */
export const brewing = {
  machine: 'Nescafé Dolce Gusto Genio S Plus',
  steps: [
    'Initializing Nescafé Dolce Gusto...',
    'Heating water to perfect 85°C...',
    'Piercing premium coffee capsule...',
    'Brewing your perfect espresso...',
    'Adding final aromatic touches...',
    'Your Nescafé is ready! :coffee:',
  ],
  /** ms between steps; the last step is "ready". */
  stepInterval: 800,
  warmingReading: ':thermometer: 75°C | 15 bar pressure',
  hotReading: ':thermometer: 85°C | 15 bar pressure',
  rebrew: 'Brew Another',
  rebrewHint: 'Click to brew more!',
}

export const quickStats = [
  { value: '2022', label: 'YC Finalist' },
  { value: '300+', label: 'Projects' },
  { value: '50K+', label: 'Helped' },
]

export const topicsTitle = 'What would you like to discuss?'

export const topics: Topic[] = [
  {
    id: 'startup',
    icon: 'rocket',
    title: 'Startup Strategy Chat',
    description:
      "I'll share insights from my YC journey and 8-digit product exit. Let's talk product roadmap, scaling, and how to avoid the classic startup mistakes!",
    tags: ['My YC Experience', 'Exit Strategy', 'Scaling Tips', 'War Stories'],
  },
  {
    id: 'architecture',
    icon: 'laptop',
    title: 'Tech Architecture Review',
    description:
      'I love diving deep into tech stacks! Let me help you choose the right architecture for your vision. No more "it depends" answers!',
    tags: ['Full Stack Magic', 'Cloud Setup', 'Tech Choices', 'No BS Advice'],
  },
  {
    id: 'fintech',
    icon: 'money',
    title: 'Fintech Deep Dive',
    description:
      "Currently leading fintech innovation at Mosambee. I can share what actually works in payments and financial products (spoiler: it's complicated).",
    tags: ['Payment Systems', 'Fintech Strategy', 'Real Experience', 'Industry Secrets'],
  },
  {
    id: 'product',
    icon: 'target',
    title: 'Product & Team Building',
    description:
      "I've built teams and products that scale. Let's discuss how to turn your idea into something people actually love (not just tolerate).",
    tags: ['Product Strategy', 'Team Building', 'User Love', 'Growth Hacks'],
  },
  {
    id: 'brainstorm',
    icon: 'brain',
    title: 'Brainstorming Session',
    description:
      'Got a crazy idea? Perfect! I specialize in turning "that\'s impossible" into "why didn\'t we think of this sooner?" Let\'s ideate!',
    tags: ['Wild Ideas', 'Innovation', 'Creative Problem Solving', 'Think Different'],
  },
  {
    id: 'crisis',
    icon: 'fire',
    title: 'Crisis Management',
    description:
      "Server down? Team revolt? Investors panicking? Been there, survived that. Let's fix it over coffee (virtual hugs included).",
    tags: ['Emergency Help', 'Crisis Mode', 'Damage Control', 'Stress Relief'],
  },
]

export const personalityTest = {
  title: 'Coffee Personality Test',
  subtitle: "Let's see what your coffee choice says about your startup style!",
  placeholder: 'Choose your coffee to see your startup personality!',
}

export const coffeeTypes: CoffeeType[] = [
  {
    id: 'espresso',
    name: 'Espresso',
    icon: 'coffee',
    personality: 'Quick & Intense',
    analysis:
      "Ah, an espresso person! You're probably the type who ships code fast and asks questions later. I like your style! :rocket:",
    booked:
      "Perfect! I'm excited to chat with a fellow espresso enthusiast. Let's make this meeting as intense as your coffee! :coffee::zap:",
  },
  {
    id: 'latte',
    name: 'Latte',
    icon: 'milk',
    personality: 'Smooth Operator',
    analysis:
      "Latte lover! You appreciate the finer things and probably write beautiful, well-documented code. We'll get along great! :sparkles:",
    booked:
      'Awesome! Looking forward to a smooth conversation with a latte lover. This will be perfectly balanced! :coffee::sparkles:',
  },
  {
    id: 'americano',
    name: 'Americano',
    icon: 'coffee',
    personality: 'No-Nonsense',
    analysis:
      "Americano - straight to the point! You're probably a backend developer who loves clean, efficient solutions. Respect! :strong:",
    booked:
      "Great! Can't wait to have a straightforward chat with an americano person. No fluff, just results! :coffee::strong:",
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    icon: 'coffee',
    personality: 'Balanced Perfectionist',
    analysis:
      'Cappuccino connoisseur! You balance art and science perfectly. Bet you write tests AND make them readable! :target:',
    booked:
      'Excellent! Ready for a perfectly balanced discussion with a cappuccino connoisseur! :coffee::target:',
  },
  {
    id: 'cold-brew',
    name: 'Cold Brew',
    icon: 'ice',
    personality: 'Cool & Patient',
    analysis:
      "Cold brew enthusiast! You're patient, methodical, and probably the person who actually reads documentation. Legend! :ice:",
    booked:
      'Amazing! Looking forward to a chill conversation with a cold brew enthusiast. Patience pays off! :coffee::ice:',
  },
  {
    id: 'frappuccino',
    name: 'Frappuccino',
    icon: 'frappe',
    personality: 'Fun & Creative',
    analysis:
      "Frappuccino fan! You're not afraid to be different and probably have the most creative solutions. Let's innovate! :rainbow:",
    booked:
      "Fantastic! Ready for a creative session with a frappuccino fan. Let's blend some wild ideas! :coffee::rainbow:",
  },
]

export const meetingTypes: MeetingType[] = [
  { id: 'video', label: 'Video Call', icon: 'video' },
  { id: 'phone', label: 'Phone Call', icon: 'call' },
  { id: 'in-person', label: 'In Person', icon: 'handshake' },
  { id: 'async', label: 'Async Chat', icon: 'chat' },
]

export const form = {
  title: 'Schedule Your Coffee Chat',
  subtitle: "Let's turn caffeine into code and ideas into reality! :coffee:→:idea:",
  name: { label: 'Your Name', placeholder: 'What should I call you?' },
  email: { label: 'Email', placeholder: 'your.awesome@email.com' },
  when: {
    label: 'Preferred Date & Time',
    hint: "I'm usually available 9 AM - 6 PM IST (coffee hours!)",
  },
  meetingType: 'Meeting Type',
  message: {
    label: "What's brewing in your mind? :brain:",
    placeholder:
      "Tell me about your project, crazy idea, or what's keeping you up at night (besides coffee)...",
  },
  submit: ":coffee: Let's Chat Over Coffee!",
  emailInstead: 'Email Instead',
  reassurance: "Don't worry, I don't bite! Unless you prefer PHP over JavaScript :grin:",
  errors: {
    name: 'I need a name to write on the cup.',
    email: 'An email so I can send the invite.',
    emailFormat: "That doesn't look like an email address.",
  },
}

export const notifications = {
  topicPicked: (title: string) => ({
    title: 'Great Choice!',
    body: `Sounds awesome! I'd love to chat about ${title.toLowerCase()}. Hit the coffee button below! :coffee:`,
  }),
  coffeePicked: (analysis: string) => ({ title: 'Coffee Choice Noted!', body: analysis }),
  missingInfo: {
    title: 'Oops! Missing Info',
    body: 'I need at least your name and email to brew this connection! :coffee:',
  },
  booked: {
    title: 'Coffee Chat Scheduled!',
    fallback: "Perfect! I'm excited to chat with you. Let's brew some amazing ideas together! :coffee:",
    openMail: 'Open Mail',
  },
}

/** Prefilled message when a topic is picked. */
export const topicMessage = (topic: Topic) =>
  `I'd love to discuss ${topic.title.toLowerCase()}. ${topic.description}`

/** Subject + body for the mailto fallback. */
export const mailDraft = {
  subject: 'Coffee chat? :coffee:',
  body: (lines: Array<string | false | null | undefined>) => lines.filter(Boolean).join('\n'),
}
