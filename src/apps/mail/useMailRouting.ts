import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useMailStore } from './store'

/**
 * Keeps the URL and the selected message in step: /app/email/<id> opens that
 * message, and picking a message updates the URL so it can be shared.
 * Outside the OS routes (the dev harness) the URL is left alone.
 */
export function useMailRouting(onDeepLink?: (id: string) => void) {
  const route = useRoute()
  const router = useRouter()
  const mail = useMailStore()

  const routed = computed(
    () => route.name === 'email' || (route.name === 'app' && route.params.appId === 'email'),
  )
  const linkedId = computed(() =>
    route.name === 'email' && typeof route.params.emailId === 'string'
      ? route.params.emailId
      : null,
  )

  function show(id: string | null) {
    if (!routed.value || id === linkedId.value) return
    void router.replace(
      id ? { name: 'email', params: { emailId: id } } : { name: 'app', params: { appId: 'email' } },
    )
  }

  watch(
    linkedId,
    (id) => {
      if (!id || id === mail.selectedId) return
      if (mail.open(id)) onDeepLink?.(id)
      else show(null)
    },
    { immediate: true },
  )

  return { show, linkedId }
}
