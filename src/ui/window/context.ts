import { inject, type ComputedRef, type InjectionKey } from 'vue'

import type { AppId, WindowChrome } from '@/apps/registry'

/** What a window gives the app rendered inside it. Provided by MacWindow. */
export interface WindowContext {
  id: AppId
  title: string
  chrome: WindowChrome
  /** True for the frontmost ("key") window. Chrome dims when false. */
  isKey: ComputedRef<boolean>
  isZoomed: ComputedRef<boolean>
  close: () => void
  minimize: () => void
  toggleZoom: () => void
}

export const WINDOW_CONTEXT: InjectionKey<WindowContext> = Symbol('window')

export function useWindowContext(): WindowContext | null {
  return inject(WINDOW_CONTEXT, null)
}
