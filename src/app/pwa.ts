import { registerSW } from 'virtual:pwa-register'

import { usePWAStore } from '@/stores/pwa'

/** Registers the service worker and routes its lifecycle into the PWA store. */
export function setupPwa(): void {
  const pwa = usePWAStore()
  const updateSW = registerSW({
    onNeedRefresh: () => pwa.setNeedRefresh(true),
    onOfflineReady: () => pwa.setOfflineReady(true),
  })
  pwa.setUpdateSW(updateSW)
}
