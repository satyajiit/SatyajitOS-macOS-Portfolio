import '@fontsource-variable/inter'
import '@/design/index.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import { setupPwa } from '@/app/pwa'
// Imported for its side effect: it must catch `beforeinstallprompt`, which can
// fire before either shell has loaded.
import '@/composables/usePwaInstall'
import { initAnalytics } from '@/lib/analytics'

import App from './App.vue'
import router from '@/app/router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

setupPwa()
void initAnalytics()
