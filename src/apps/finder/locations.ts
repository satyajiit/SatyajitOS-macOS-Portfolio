import {
  Camera,
  CircleArrowDown,
  Coffee,
  FileCode,
  FileText,
  Folder,
  HardDrive,
  Image,
  Monitor,
  Rocket,
} from '@lucide/vue'
import type { Component } from 'vue'

import type { TagColor } from '@/content/files'

import type { FolderEmblem } from './icons/FileIcon.vue'

/** SF Symbol stand-ins for sidebar rows. */
const SIDEBAR_ICONS: Record<string, Component> = {
  desktop: Monitor,
  downloads: CircleArrowDown,
  documents: FileText,
  'coffee-addiction': Coffee,
  memes: Image,
  screenshots: Camera,
  'code-graveyard': FileCode,
  'yc-journey': Rocket,
  home: HardDrive,
}

export function sidebarIcon(id: string): Component {
  return SIDEBAR_ICONS[id] ?? Folder
}

/** Engraved symbol on special folders, like Finder's Desktop/Documents/Downloads. */
const EMBLEMS: Record<string, FolderEmblem> = {
  desktop: 'desktop',
  documents: 'documents',
  downloads: 'downloads',
  home: 'home',
  'coffee-addiction': 'coffee',
  memes: 'image',
  screenshots: 'smart',
  'code-graveyard': 'smart',
  'yc-journey': 'smart',
  'fintech-innovations': 'smart',
  'resume-collection': 'lock',
  'innovation-lab': 'lock',
}

export function folderEmblem(id: string): FolderEmblem | null {
  return EMBLEMS[id] ?? null
}

/** Tag dots use the system colours, so they follow light/dark like Finder's. */
export const TAG_TOKENS: Record<TagColor, string> = {
  red: 'var(--sys-red)',
  orange: 'var(--sys-orange)',
  yellow: 'var(--sys-yellow)',
  green: 'var(--sys-green)',
  blue: 'var(--sys-blue)',
  purple: 'var(--sys-purple)',
  gray: 'var(--sys-gray)',
}
