/* eslint-disable vue/one-component-per-file -- tiny throwaway test components */
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import { useMailStore } from '../store'
import { useMailRouting } from '../useMailRouting'

const Blank = defineComponent({ render: () => h('div') })

function setup() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: Blank },
      { path: '/app/:appId', name: 'app', component: Blank },
      { path: '/app/email/:emailId', name: 'email', component: Blank },
      { path: '/__app/:appId', component: Blank },
    ],
  })
  let api!: ReturnType<typeof useMailRouting>
  const Probe = defineComponent({
    setup() {
      api = useMailRouting()
      return () => h('div')
    },
  })
  return {
    router,
    mountProbe: () => mount(Probe, { global: { plugins: [router] } }),
    api: () => api,
  }
}

describe('mail routing', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('opens the linked message, switching mailbox if needed', async () => {
    const { router, mountProbe } = setup()
    await router.push('/app/email/spam-1')
    mountProbe()
    const mail = useMailStore()
    expect(mail.selectedId).toBe('spam-1')
    expect(mail.mailbox).toBe('junk')
  })

  it('writes the selection into the URL and clears it on close', async () => {
    const { router, mountProbe, api } = setup()
    await router.push('/app/email')
    mountProbe()
    api().show('3')
    await nextTick()
    await router.isReady()
    await new Promise((r) => setTimeout(r))
    expect(router.currentRoute.value.fullPath).toBe('/app/email/3')
    api().show(null)
    await new Promise((r) => setTimeout(r))
    expect(router.currentRoute.value.fullPath).toBe('/app/email')
  })

  it('falls back to the mailbox for an unknown message', async () => {
    const { router, mountProbe } = setup()
    await router.push('/app/email/nope')
    mountProbe()
    await new Promise((r) => setTimeout(r))
    expect(router.currentRoute.value.fullPath).toBe('/app/email')
  })

  it('leaves non-OS URLs alone (dev harness)', async () => {
    const { router, mountProbe, api } = setup()
    await router.push('/__app/email')
    mountProbe()
    api().show('3')
    await new Promise((r) => setTimeout(r))
    expect(router.currentRoute.value.fullPath).toBe('/__app/email')
  })
})
