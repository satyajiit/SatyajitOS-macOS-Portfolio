/**
 * ↑/↓ navigation over past commands. Index -1 is the line being typed; its
 * text is kept as the draft so arrowing back down restores it, like zsh.
 */
export class HistoryCursor {
  private index = -1
  private draft = ''

  constructor(private readonly entries: () => readonly string[]) {}

  prev(current: string): string | null {
    const list = this.entries()
    if (!list.length) return null
    if (this.index === -1) {
      this.draft = current
      this.index = list.length - 1
    } else if (this.index > 0) {
      this.index--
    } else {
      return null
    }
    return list[this.index] ?? null
  }

  next(): string | null {
    const list = this.entries()
    if (this.index === -1) return null
    if (this.index < list.length - 1) {
      this.index++
      return list[this.index] ?? null
    }
    this.index = -1
    return this.draft
  }

  reset() {
    this.index = -1
    this.draft = ''
  }
}
