/**
 * Optional analytics. Firebase is only downloaded when all VITE_FIREBASE_*
 * variables are set; otherwise every call is a no-op and the SDK never ships
 * to the browser.
 */

type Params = Record<string, string | number | boolean | undefined>

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const analyticsEnabled = Boolean(
  config.apiKey && config.projectId && config.appId && config.measurementId,
)

let send: ((name: string, params?: Params) => void) | null = null
let pending: Array<[string, Params | undefined]> = []

export async function initAnalytics(): Promise<void> {
  if (!analyticsEnabled || send) return
  try {
    const [{ initializeApp }, { getAnalytics, isSupported, logEvent }] = await Promise.all([
      import('firebase/app'),
      import('firebase/analytics'),
    ])
    if (!(await isSupported())) return
    const analytics = getAnalytics(initializeApp(config))
    send = (name, params) => logEvent(analytics, name, params)
    for (const [name, params] of pending) send(name, params)
    pending = []
  } catch {
    // Blocked by an extension or offline: analytics is best-effort.
    pending = []
  }
}

export function track(name: string, params?: Params): void {
  if (!analyticsEnabled) return
  if (send) send(name, params)
  else if (pending.length < 50) pending.push([name, params])
}
