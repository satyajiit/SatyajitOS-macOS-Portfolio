import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/** Routes owned by the OS shells; anything else (dev harness) is left alone. */
const OS_ROUTES = new Set(['home', 'app', 'finder'])

/**
 * Keeps /finder/:folderId?/:itemId? in step with the file browser.
 * `apply` runs for deep links (on mount and when the URL changes from
 * outside); `sync` writes the current folder/item back with replace().
 */
export function useFinderRoute(apply: (folderId: string, itemId?: string) => void) {
  const route = useRoute()
  const router = useRouter()

  const current = () => ({
    folderId: typeof route.params.folderId === 'string' ? route.params.folderId : '',
    itemId: typeof route.params.itemId === 'string' ? route.params.itemId : '',
  })

  const lastSynced = { folderId: '', itemId: '' }

  onMounted(() => {
    const { folderId, itemId } = current()
    if (route.name === 'finder' && folderId) apply(folderId, itemId || undefined)
  })

  watch(
    () => [route.name, route.params.folderId, route.params.itemId],
    () => {
      const { folderId, itemId } = current()
      if (route.name !== 'finder' || !folderId) return
      if (folderId === lastSynced.folderId && itemId === lastSynced.itemId) return
      apply(folderId, itemId || undefined)
    },
  )

  function sync(folderId: string, itemId?: string) {
    if (!OS_ROUTES.has(String(route.name))) return
    const now = current()
    lastSynced.folderId = folderId
    lastSynced.itemId = itemId ?? ''
    if (route.name === 'finder' && now.folderId === folderId && now.itemId === (itemId ?? '')) return
    void router.replace({ name: 'finder', params: { folderId, itemId: itemId ?? '' } })
  }

  return { sync }
}
