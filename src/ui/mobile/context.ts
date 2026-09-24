import { inject, type InjectionKey } from 'vue'

/** Provided by the phone shell (and the dev harness) to every mobile app. */
export interface MobileAppContext {
  /** Swipe-up / back-to-home. */
  close: () => void
}

export const MOBILE_APP_CONTEXT: InjectionKey<MobileAppContext> = Symbol('mobile-app')

export function useMobileApp(): MobileAppContext {
  return inject(MOBILE_APP_CONTEXT, { close: () => history.back() })
}
