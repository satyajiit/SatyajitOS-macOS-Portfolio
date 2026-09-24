import { Award, ChartColumn, DollarSign, Gem, Hammer, Rocket, Star, Trophy, Zap } from '@lucide/vue'
import type { Component } from 'vue'

import type { AboutIcon, Highlight } from '@/content/about'

/** SF Symbol stand-ins for the icon keys used in content/about.ts. */
export const aboutIcons: Record<AboutIcon, Component> = {
  rocket: Rocket,
  trophy: Trophy,
  gem: Gem,
  award: Award,
  hammer: Hammer,
  star: Star,
  zap: Zap,
  chart: ChartColumn,
  dollar: DollarSign,
}

/** A highlight's tint as a live system-colour token. */
export const tintVar = (tint: Highlight['tint']) => `var(--sys-${tint})`
