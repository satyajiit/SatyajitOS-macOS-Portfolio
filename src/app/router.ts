import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { useAnalytics } from '@/composables/useAnalytics'

const OsRoot = () => import('@/shells/OsRoot.vue')

/**
 * One route table for both shells. The URL names an app (and optionally a
 * mail message or a Finder folder/item); each shell decides how to show it.
 */
const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: OsRoot },
  { path: '/app/:appId', name: 'app', component: OsRoot },
  { path: '/app/email/:emailId', name: 'email', component: OsRoot },
  { path: '/finder/:folderId?/:itemId?', name: 'finder', component: OsRoot },

  // Links from the previous version of the site
  { path: '/ios', redirect: '/' },
  { path: '/ios/app/termux', redirect: '/app/terminal' },
  { path: '/ios/app/:appId', redirect: (to) => `/app/${to.params.appId}` },
  { path: '/ios/app/email/:emailId', redirect: (to) => `/app/email/${to.params.emailId}` },
  { path: '/ios/finder/:folderId?/:itemId?', redirect: (to) => ({ name: 'finder', params: to.params }) },
  { path: '/app/termux', redirect: '/app/terminal' },
]

if (import.meta.env.DEV) {
  routes.push(
    { path: '/__kit', component: () => import('@/dev/KitPreview.vue') },
    { path: '/__app/:appId', component: () => import('@/dev/AppHarness.vue') },
    { path: '/__icon/:name', component: () => import('@/dev/IconRender.vue') },
  )
}

routes.push({ path: '/:pathMatch(.*)*', redirect: '/' })

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.afterEach((to) => {
  useAnalytics().trackPageView(String(to.name ?? 'unknown'), document.title)
})

export default router
