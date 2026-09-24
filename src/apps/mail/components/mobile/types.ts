import type { Component } from 'vue'

export interface SwipeAction {
  label: string
  icon: Component
  tone: 'accent' | 'orange' | 'red' | 'gray'
  run: () => void
}
