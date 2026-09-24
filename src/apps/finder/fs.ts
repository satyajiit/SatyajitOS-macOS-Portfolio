import {
  finderCopy,
  folders,
  HOME,
  smartFolders,
  tags,
  type FileEntry,
  type FolderEntry,
  type PreviewBlock,
  type TagColor,
} from '@/content/files'

/**
 * Pure helpers over the content in src/content/files.ts. No Vue, no state:
 * the desktop store and the phone app both resolve locations through here,
 * which also keeps it easy to unit test.
 */

export type FileKind =
  | 'folder'
  | 'spreadsheet'
  | 'document'
  | 'presentation'
  | 'pdf'
  | 'image'
  | 'video'
  | 'code'
  | 'markdown'
  | 'text'
  | 'diskImage'
  | 'package'
  | 'design'
  | 'unknown'

export interface Item extends FileEntry {
  kind: FileKind
  /** Lower-case extension without the dot ('' for folders). */
  ext: string
  /** Folder the item lives in. */
  parentId: string
  /** Absolute path, e.g. /Users/satyajit/Desktop/Coffee_Addiction_Stats.csv */
  path: string
}

export type LocationKind = 'folder' | 'smart' | 'tag'

export interface Location {
  id: string
  kind: LocationKind
  name: string
  path: string
  description?: string
  items: Item[]
  /** Set when the location exists but can't be browsed. */
  error?: 'permission'
  tagColor?: TagColor
}

const EXTENSION_KINDS: Record<string, FileKind> = {
  csv: 'spreadsheet',
  xlsx: 'spreadsheet',
  docx: 'document',
  pptx: 'presentation',
  pdf: 'pdf',
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  gif: 'image',
  mp4: 'video',
  md: 'markdown',
  txt: 'text',
  py: 'code',
  js: 'code',
  ts: 'code',
  sol: 'code',
  ino: 'code',
  qasm: 'code',
  dmg: 'diskImage',
  apk: 'package',
  sketch: 'design',
}

const KIND_LABELS: Record<string, string> = {
  csv: 'CSV Document',
  xlsx: 'Microsoft Excel spreadsheet',
  docx: 'Microsoft Word document',
  pptx: 'Microsoft PowerPoint presentation',
  pdf: 'PDF Document',
  jpg: 'JPEG image',
  jpeg: 'JPEG image',
  png: 'PNG image',
  gif: 'GIF image',
  mp4: 'MPEG-4 movie',
  md: 'Markdown Document',
  txt: 'Plain Text Document',
  py: 'Python script',
  js: 'JavaScript script',
  ts: 'TypeScript source',
  sol: 'Solidity source',
  ino: 'Arduino sketch',
  qasm: 'OpenQASM source',
  dmg: 'Disk Image',
  apk: 'Android Package',
  sketch: 'Sketch document',
}

const CODE_LANGUAGES: Record<string, string> = {
  py: 'Python',
  js: 'JavaScript',
  ts: 'TypeScript',
  sol: 'Solidity',
  ino: 'Arduino',
  qasm: 'OpenQASM',
  csv: 'CSV',
  md: 'Markdown',
  txt: 'Plain Text',
}

export function extOf(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : ''
}

export function kindOf(entry: Pick<FileEntry, 'name' | 'type'>): FileKind {
  if (entry.type === 'folder') return 'folder'
  return EXTENSION_KINDS[extOf(entry.name)] ?? 'unknown'
}

export function kindLabel(item: Pick<Item, 'kind' | 'ext'>): string {
  if (item.kind === 'folder') return 'Folder'
  return KIND_LABELS[item.ext] ?? 'Document'
}

export function languageOf(item: Pick<Item, 'ext'>): string {
  return CODE_LANGUAGES[item.ext] ?? 'Text'
}

function dirname(path: string): string {
  const cut = path.lastIndexOf('/')
  return cut > 0 ? path.slice(0, cut) : '/'
}

function toItem(entry: FileEntry, folder: Pick<FolderEntry, 'id' | 'path'>): Item {
  return {
    ...entry,
    kind: kindOf(entry),
    ext: entry.type === 'folder' ? '' : extOf(entry.name),
    parentId: folder.id,
    path: `${folder.path}/${entry.name}`,
  }
}

const folderById = new Map(folders.map((f) => [f.id, f]))
const folderByPath = new Map(folders.map((f) => [f.path, f]))

/**
 * The closest folder above `path` that actually exists. Memes/Work has no
 * "Memes" folder, so it shows up directly in the home folder.
 */
function nearestParent(path: string): FolderEntry | undefined {
  let dir = dirname(path)
  while (dir !== '/') {
    const hit = folderByPath.get(dir)
    if (hit) return hit
    dir = dirname(dir)
  }
  return undefined
}

/** Items of a folder: its own entries plus sub-folders that live under its path. */
function folderItems(folder: FolderEntry): Item[] {
  const own = folder.items.map((entry) => toItem(entry, folder))
  const seen = new Set(own.map((i) => i.id))
  const nested = folders
    .filter((child) => child.id !== folder.id && !seen.has(child.id) && nearestParent(child.path)?.id === folder.id)
    .map((child) =>
      toItem(
        { id: child.id, name: child.name, type: 'folder', description: child.description },
        folder,
      ),
    )
  return [...own, ...nested]
}

let cachedAll: Item[] | null = null

/** Every item on disk (files and folders), each once. */
export function allItems(): Item[] {
  if (cachedAll) return cachedAll
  const byId = new Map<string, Item>()
  for (const folder of folders) {
    for (const item of folderItems(folder)) if (!byId.has(item.id)) byId.set(item.id, item)
  }
  cachedAll = [...byId.values()]
  return cachedAll
}

export function findItem(id: string): Item | undefined {
  return allItems().find((item) => item.id === id)
}

function matchesSmart(item: Item, match: (typeof smartFolders)[number]['match']): boolean {
  if (item.kind === 'folder') return false
  const name = item.name.toLowerCase()
  if (match.extensions?.includes(item.ext)) return true
  if (match.names?.some((n) => name.includes(n))) return true
  if (match.tags?.some((t) => item.tags?.includes(t))) return true
  return false
}

export function tagLocationId(color: TagColor): string {
  return `tag-${color}`
}

/** Resolve a folder, smart folder or tag id into something browsable. */
export function resolveLocation(id: string): Location | null {
  const folder = folderById.get(id)
  if (folder) {
    return {
      id,
      kind: 'folder',
      name: folder.name,
      path: folder.path,
      description: folder.description,
      items: folder.locked ? [] : folderItems(folder),
      error: folder.locked ? 'permission' : undefined,
    }
  }

  const smart = smartFolders.find((s) => s.id === id)
  if (smart) {
    return {
      id,
      kind: 'smart',
      name: smart.name,
      path: `${HOME}/Smart Folders/${smart.name}`,
      description: smart.description,
      items: allItems().filter((item) => matchesSmart(item, smart.match)),
    }
  }

  const tag = tags.find((t) => tagLocationId(t.color) === id)
  if (tag) {
    return {
      id,
      kind: 'tag',
      name: tag.name,
      path: `Tags/${tag.name}`,
      items: allItems().filter((item) => item.tags?.some((t) => tag.matches.includes(t))),
      tagColor: tag.color,
    }
  }

  // A folder item with nothing inside it (e.g. a side project): browsable but empty.
  const item = findItem(id)
  if (item?.kind === 'folder') {
    return { id, kind: 'folder', name: item.name, path: item.path, description: item.description, items: [] }
  }
  return null
}

export function locationExists(id: string): boolean {
  return resolveLocation(id) !== null
}

/** The folder that contains a location (⌘↑). Null at the top or for smart folders and tags. */
export function parentOf(id: string): string | null {
  const location = resolveLocation(id)
  if (!location || location.kind !== 'folder') return null
  const folder = folderById.get(id)
  if (folder) return nearestParent(folder.path)?.id ?? null
  return findItem(id)?.parentId ?? null
}

export interface Crumb {
  name: string
  /** Browsable location for this segment, when there is one. */
  id?: string
}

/** Path bar segments, Finder style: Macintosh HD › Users › satyajit › Documents */
export function breadcrumbs(location: Location): Crumb[] {
  if (location.kind !== 'folder') return [{ name: location.name, id: location.id }]
  const parts = location.path.split('/').filter(Boolean)
  const crumbs: Crumb[] = [{ name: 'Macintosh HD' }]
  let path = ''
  for (const part of parts) {
    path += `/${part}`
    const folder = folderByPath.get(path)
    crumbs.push({ name: folder?.name ?? part, id: folder?.id })
  }
  const last = crumbs[crumbs.length - 1]
  if (last && !last.id) last.id = location.id
  return crumbs
}

/** Case-insensitive search over name, description and tags. */
export function searchItems(query: string, within: Item[] = allItems()): Item[] {
  const q = query.trim().toLowerCase()
  if (!q) return within
  return within.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.tags?.some((t) => t.toLowerCase().includes(q)),
  )
}

/** Tag colours an item carries (for the little dots next to names). */
export function tagColorsOf(item: Pick<Item, 'tags'>, extra: string[] = []): TagColor[] {
  const all = [...(item.tags ?? []), ...extra]
  return tags.filter((t) => t.matches.some((m) => all.includes(m))).map((t) => t.color)
}

// ── Sorting ────────────────────────────────────────────────────────────────

export type SortKey = 'name' | 'modified' | 'size' | 'kind'

const UNITS: Record<string, number> = { bytes: 1, kb: 1e3, mb: 1e6, gb: 1e9 }

export function sizeInBytes(size?: string): number {
  if (!size) return -1
  const match = /([\d.]+)\s*(bytes|kb|mb|gb)/i.exec(size)
  if (!match) return -1
  return Number(match[1]) * (UNITS[match[2]!.toLowerCase()] ?? 1)
}

const MINUTES: Record<string, number> = {
  minute: 1,
  hour: 60,
  day: 1440,
  week: 10080,
  month: 43200,
  year: 525600,
}

/** Rough age in minutes for "2 hours ago", "Yesterday", "Last week"… so the column sorts sensibly. */
export function ageInMinutes(modified?: string): number {
  if (!modified) return Number.POSITIVE_INFINITY
  const text = modified.toLowerCase()
  if (text === 'today') return 60
  if (text === 'yesterday') return MINUTES.day!
  if (text === 'never') return Number.POSITIVE_INFINITY
  const last = /^last (\w+)$/.exec(text)
  if (last) return MINUTES[last[1]!] ?? Number.POSITIVE_INFINITY
  const ago = /([\d.]+)\s*(minute|hour|day|week|month|year)s?\s+ago/.exec(text)
  if (ago) return Number(ago[1]) * (MINUTES[ago[2]!] ?? 1)
  return Number.POSITIVE_INFINITY
}

export function sortItems(items: Item[], key: SortKey, dir: 1 | -1): Item[] {
  const byName = (a: Item, b: Item) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
  const compare: Record<SortKey, (a: Item, b: Item) => number> = {
    name: byName,
    // Newest first reads as "ascending" for dates, like Finder.
    modified: (a, b) => ageInMinutes(a.modified) - ageInMinutes(b.modified),
    size: (a, b) => sizeInBytes(a.size) - sizeInBytes(b.size),
    kind: (a, b) => kindLabel(a).localeCompare(kindLabel(b)),
  }
  return [...items].sort((a, b) => compare[key](a, b) * dir || byName(a, b))
}

// ── Previews and flavour text ──────────────────────────────────────────────

/** Stable pseudo-random number per id, so "fun stats" don't reshuffle on every render. */
export function hashOf(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function pick<T>(list: readonly T[], id: string, salt = 0): T {
  return list[(hashOf(id) + salt) % list.length]!
}

export function statBetween(id: string, min: number, max: number, salt = 0): number {
  return min + ((hashOf(id) >>> salt % 16) % (max - min + 1))
}

/** Blocks to render for an item: its own, or a sensible default for its kind. */
export function previewOf(item: Item): PreviewBlock[] {
  if (item.preview?.length) return item.preview
  if (item.kind === 'code') {
    return [
      {
        type: 'text',
        mono: true,
        language: languageOf(item),
        body: fill(finderCopy.fallbackCode, { name: item.name, lines: String(statBetween(item.id, 42, 1337)) }),
      },
    ]
  }
  return [
    {
      type: 'text',
      body: fill(finderCopy.fallbackText, { name: item.name, about: item.description || 'various topics' }),
    },
  ]
}

export function quipOf(item: Item): string {
  return item.quip ?? pick(finderCopy.genericQuips, item.id)
}

export function kindQuipOf(item: Item): string {
  return finderCopy.kindQuips[item.ext] ?? 'Digital artifact of unknown origin'
}

export function insightOf(item: Item): string {
  return item.insight ?? finderCopy.genericInsight
}

/** "Satyajit's metadata": jokes, but stable per file. */
export function funStatsOf(item: Item) {
  return {
    timesOpened: statBetween(item.id, 1, 847, 1),
    procrastination: statBetween(item.id, 1, 10, 3),
    importance: pick(finderCopy.importance, item.id, 5),
    coffee: statBetween(item.id, 1, 15, 7),
  }
}

export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '')
}

export function lineCount(text: string): number {
  return text.split('\n').length
}

const OPEN_WITH: Partial<Record<FileKind, string>> = {
  folder: 'Finder',
  spreadsheet: 'Numbers',
  document: 'Pages',
  presentation: 'Keynote',
  pdf: 'Preview',
  image: 'Preview',
  video: 'QuickTime Player',
  code: 'TextEdit',
  markdown: 'TextEdit',
  text: 'TextEdit',
  diskImage: 'DiskImageMounter',
  package: 'Android Studio',
  design: 'Sketch',
}

/** The app Quick Look's "Open with …" button names. */
export function openWithApp(item: Pick<Item, 'kind'>): string {
  return OPEN_WITH[item.kind] ?? 'TextEdit'
}
