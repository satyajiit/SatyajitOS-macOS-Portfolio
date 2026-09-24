import type { Component } from 'vue'

import AboutIcon from './AboutIcon.vue'
import BrandIcon from './BrandIcon.vue'
import CoffeeIcon from './CoffeeIcon.vue'
import FinderIcon from './FinderIcon.vue'
import MailIcon from './MailIcon.vue'
import SettingsIcon from './SettingsIcon.vue'
import TerminalIcon from './TerminalIcon.vue'

export const appIcons = {
  about: AboutIcon,
  brand: BrandIcon,
  coffee: CoffeeIcon,
  finder: FinderIcon,
  mail: MailIcon,
  settings: SettingsIcon,
  terminal: TerminalIcon,
} satisfies Record<string, Component>

export type AppIconName = keyof typeof appIcons

export { SQUIRCLE_PATH } from './squircle'
