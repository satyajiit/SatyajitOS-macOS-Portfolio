import { watch } from 'vue'
import { useRoute, useRouter, type RouteLocationNormalizedLoaded } from 'vue-router'

import { getApp, type AppId } from '@/apps/registry'
import { useMobileStore } from '@/stores/mobile'

/** Which app a URL points at: /app/:appId, /app/email/:id and /finder/… all count. */
function appFromRoute(route: RouteLocationNormalizedLoaded): AppId | null {
  if (route.name === 'email') return 'email'
  if (route.name === 'finder') return 'finder'
  if (route.name === 'app') {
    const id = String(route.params.appId ?? '')
    return getApp(id)?.mobile ? (id as AppId) : null
  }
  return null
}

/**
 * Keeps the URL and the foreground app in step, both ways. Browser back
 * closes the app; closing the app goes back (or to "/" after a deep link).
 */
export function useMobileRouting() {
  const route = useRoute()
  const router = useRouter()
  const store = useMobileStore()

  watch(
    () => route.fullPath,
    () => {
      const id = appFromRoute(route)
      if (id) store.openApp(id, store.activeApp === id ? store.launchRect : null)
      else if (route.name === 'home' && store.activeApp) store.closeApp()
    },
    { immediate: true },
  )

  watch(
    () => store.activeApp,
    (id) => {
      const current = appFromRoute(route)
      if (id && current !== id) {
        router.push({ name: 'app', params: { appId: id } })
      } else if (!id && current) {
        // Pop our own history entry when there is one, so Back doesn't reopen the app.
        const state = window.history.state as { back?: string | null } | null
        if (state?.back) router.back()
        else router.replace({ name: 'home' })
      }
    },
  )
}
