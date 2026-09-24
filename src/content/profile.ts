import avatar from '@/assets/images/own_pic.webp'
import type { BrandName } from '@/ui/brand/registry'

/**
 * Who this OS belongs to. Every app reads name, contact and links from here,
 * so a fork only has to change this file (plus the photo) to rebrand the
 * whole desktop.
 */
export const profile = {
  name: 'Satyajit Pradhan',
  firstName: 'Satyajit',
  handle: 'satyajiit',
  /** Unix-y username used by Terminal prompts and the lock screen. */
  username: 'satyajit',
  headline: 'Product + Tech Alchemist',
  role: 'Head of Product & Innovations',
  company: 'Mosambee',
  tagline: 'Coding the Life />',
  location: 'Mumbai, IN',
  email: 'Satyajiit0@gmail.com',
  avatar,
  links: {
    github: 'https://github.com/satyajiit',
    linkedin: 'https://linkedin.com/in/satyajiit',
    twitter: 'https://twitter.com/satyajiit',
  },
  highlights: ['YC 22 Finalist', 'Built & exited ZyadaShop', 'Google AppScale Academy'],
} as const

/** Social links in display order; `brand` picks the svgl logo shown next to each. */
export const socials: { label: string; url: string; brand: BrandName }[] = [
  { label: 'GitHub', url: profile.links.github, brand: 'github' },
  { label: 'LinkedIn', url: profile.links.linkedin, brand: 'linkedin' },
  { label: 'X (Twitter)', url: profile.links.twitter, brand: 'x' },
]

export type Profile = typeof profile
