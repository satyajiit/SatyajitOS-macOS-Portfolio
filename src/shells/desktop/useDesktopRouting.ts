import { watch, type Ref } from 'vue'
import { useRoute, useRouter, type RouteLocationNormalizedLoaded } from 'vue-router'

import { getApp, isAppId, type AppId } from '@/apps/registry'
import { useWindowsStore } from '@/stores/windows'

/** The app a URL points at: /app/:appId, /app/email/:emailId, /finder/... */
function appFromRoute(route: RouteLocationNormalizedLoaded): AppId | null {
  if (route.name === 'email') return 'email'
  if (route.name === 'finder') return 'finder'
  if (route.name === 'app' && isAppId(route.params.appId)) return route.params.appId
  return null
}

/**
 * Keeps the address bar and the windows in step. Opening a URL opens its
 * window; bringing a window to the front updates the URL (without touching
 * deeper links an app manages itself, like a specific email or folder).
 * `ready` holds URL-driven opens back until the boot screen is done.
 */
export function useDesktopRouting(ready: Ref<boolean>) {
  const route = useRoute()
  const router = useRouter()
  const windows = useWindowsStore()

  watch(
    [() => route.fullPath, ready],
    () => {
      if (!ready.value) return
      const id = appFromRoute(route)
      if (id && getApp(id)?.desktop) {
        if (windows.focusedId !== id) windows.open(id)
      } else if (route.name === 'app') {
        // An app with no Mac version (e.g. Settings) or a typo.
        void router.replace('/')
      }
    },
    { immediate: true },
  )

  watch(
    () => windows.focusedId,
    (id) => {
      if (!ready.value) return
      const current = appFromRoute(route)
      if (id && id !== current) void router.replace(`/app/${id}`)
      else if (!id && current) void router.replace('/')
    },
  )
}
