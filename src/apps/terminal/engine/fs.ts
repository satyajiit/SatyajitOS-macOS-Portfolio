import type { FsDirSpec, FsNodeSpec } from './types'

/**
 * In-memory file system built from the content tree. Paths are always
 * normalised absolute strings; the shell resolves user input against its cwd.
 */

export interface FsFile {
  kind: 'file'
  name: string
  content: string
  mode: string
  size: number
  owner: string
  modified: Date
}

export interface FsDir {
  kind: 'dir'
  name: string
  mode: string
  owner: string
  modified: Date
  children: Map<string, FsNode>
}

export type FsNode = FsFile | FsDir

/** Collapse `.`, `..` and duplicate slashes. `..` above `/` stays at `/`. */
export function normalize(path: string): string {
  const out: string[] = []
  for (const part of path.split('/')) {
    if (!part || part === '.') continue
    if (part === '..') out.pop()
    else out.push(part)
  }
  return '/' + out.join('/')
}

export function resolvePath(input: string, cwd: string, home: string): string {
  if (input === '~') return home
  if (input.startsWith('~/')) return normalize(home + input.slice(1))
  if (input.startsWith('/')) return normalize(input)
  return normalize(`${cwd}/${input}`)
}

/** zsh-style display: `~`, `~/Projects`, or the absolute path outside home. */
export function displayPath(path: string, home: string): string {
  if (path === home) return '~'
  if (path.startsWith(home + '/')) return '~' + path.slice(home.length)
  return path
}

export function basename(path: string): string {
  if (path === '/') return '/'
  return path.slice(path.lastIndexOf('/') + 1)
}

export function dirname(path: string): string {
  const i = path.lastIndexOf('/')
  return i <= 0 ? '/' : path.slice(0, i)
}

export class VirtualFs {
  readonly root: FsDir

  constructor(
    spec: FsDirSpec,
    private readonly user: string,
    now: Date = new Date(),
  ) {
    this.root = this.build('/', spec, now) as FsDir
  }

  private build(name: string, spec: FsNodeSpec, now: Date): FsNode {
    const owner = spec.owner ?? this.user
    if (spec.kind === 'file') {
      return {
        kind: 'file',
        name,
        content: spec.content,
        mode: spec.mode ?? '-rw-r--r--',
        size: spec.size ?? spec.content.length,
        owner,
        modified: now,
      }
    }
    const children = new Map<string, FsNode>()
    for (const [child, childSpec] of Object.entries(spec.children)) {
      children.set(child, this.build(child, childSpec, now))
    }
    return { kind: 'dir', name, mode: spec.mode ?? 'drwxr-xr-x', owner, modified: now, children }
  }

  get(path: string): FsNode | null {
    let node: FsNode = this.root
    for (const part of path.split('/').filter(Boolean)) {
      if (node.kind !== 'dir') return null
      const next = node.children.get(part)
      if (!next) return null
      node = next
    }
    return node
  }

  /** Children sorted like the legacy listing: directories first, then by name. */
  list(dir: FsDir, showHidden = false): FsNode[] {
    return [...dir.children.values()]
      .filter((node) => showHidden || !node.name.startsWith('.'))
      .sort((a, b) =>
        a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === 'dir' ? -1 : 1,
      )
  }

  mkdir(path: string, now = new Date()): 'ok' | 'exists' | 'no-parent' {
    const parent = this.get(dirname(path))
    if (!parent || parent.kind !== 'dir') return 'no-parent'
    const name = basename(path)
    if (parent.children.has(name)) return 'exists'
    parent.children.set(name, {
      kind: 'dir',
      name,
      mode: 'drwxr-xr-x',
      owner: this.user,
      modified: now,
      children: new Map(),
    })
    return 'ok'
  }

  touch(path: string, now = new Date()): 'ok' | 'no-parent' {
    const parent = this.get(dirname(path))
    if (!parent || parent.kind !== 'dir') return 'no-parent'
    const name = basename(path)
    const existing = parent.children.get(name)
    if (existing) existing.modified = now
    else
      parent.children.set(name, {
        kind: 'file',
        name,
        content: '',
        mode: '-rw-r--r--',
        size: 0,
        owner: this.user,
        modified: now,
      })
    return 'ok'
  }
}

/** 1536 → "2K", like `ls -lh` (the legacy terminal always used this form). */
export function formatSize(bytes: number): string {
  const units = ['B', 'K', 'M', 'G', 'T']
  let size = bytes
  let unit = 0
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit++
  }
  return `${Math.round(size)}${units[unit]}`
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** `ls -l` date column: "Sep 24 17:05". */
export function formatLsDate(date: Date): string {
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${MONTHS[date.getMonth()]} ${String(date.getDate()).padStart(2, ' ')} ${hh}:${mm}`
}
