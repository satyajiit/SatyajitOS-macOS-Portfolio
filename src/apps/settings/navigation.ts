import { inject, type InjectionKey } from 'vue'

export type SettingsPageId =
  | 'root'
  | 'profile'
  | 'wifi'
  | 'bluetooth'
  | 'notifications'
  | 'display'
  | 'about'
  | 'update'
  | 'install'
  | 'developer'

export interface SettingsNav {
  push: (page: SettingsPageId) => void
  back: () => void
  /** Title of the page underneath, for the back button. */
  backLabel: () => string | undefined
}

export const SETTINGS_NAV: InjectionKey<SettingsNav> = Symbol('settings-nav')

export function useSettingsNav(): SettingsNav {
  const nav = inject(SETTINGS_NAV)
  if (!nav) throw new Error('Settings pages must render inside SettingsMobile')
  return nav
}
