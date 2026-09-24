import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePWAStore = defineStore('pwa', () => {
  // State
  const needRefresh = ref(false)
  const offlineReady = ref(false)
  const updateAvailable = ref(false)
  const showUpdatePrompt = ref(false)
  
  // Update function reference (will be set by main.ts)
  const updateSW = ref<((reloadPage?: boolean) => Promise<void>) | null>(null)

  // Actions
  const setNeedRefresh = (value: boolean) => {
    needRefresh.value = value
    updateAvailable.value = value
    if (value) {
      showUpdatePrompt.value = true
    }
  }

  const setOfflineReady = (value: boolean) => {
    offlineReady.value = value
  }

  const setUpdateSW = (updateFunction: (reloadPage?: boolean) => Promise<void>) => {
    updateSW.value = updateFunction
  }

  const hideUpdatePrompt = () => {
    showUpdatePrompt.value = false
  }

  const refreshApp = async () => {
    if (updateSW.value) {
      try {
        await updateSW.value(true)
        // Force reload if the update doesn't automatically reload
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } catch (error) {
        console.error('Failed to update app:', error)
        // Fallback: force reload
        window.location.reload()
      }
    } else {
      // Fallback: force reload
      window.location.reload()
    }
  }

  const dismissUpdate = () => {
    hideUpdatePrompt()
    setNeedRefresh(false)
  }

  return {
    // State
    needRefresh,
    offlineReady,
    updateAvailable,
    showUpdatePrompt,
    
    // Actions
    setNeedRefresh,
    setOfflineReady,
    setUpdateSW,
    hideUpdatePrompt,
    refreshApp,
    dismissUpdate
  }
})
