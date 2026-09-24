export interface MenuAction {
  kind?: 'item'
  label: string
  shortcut?: string
  disabled?: boolean
  checked?: boolean
  destructive?: boolean
  action?: () => void
}

export interface MenuSeparator {
  kind: 'separator'
}

export type MenuEntry = MenuAction | MenuSeparator

export interface TopMenu {
  id: string
  label: string
  bold?: boolean
  brand?: boolean
  entries: MenuEntry[]
}
