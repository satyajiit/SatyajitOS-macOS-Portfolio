<script setup lang="ts">
import { FolderOpen, Lock, Search, TriangleAlert, Wifi } from '@lucide/vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { finderCopy } from '@/content/files'
import { UiButton, UiSpinner } from '@/ui'

import { fill } from '../fs'

export type ErrorType = keyof typeof finderCopy.errors

/**
 * Loading, empty, no-results and error states, with the original copy.
 * Errors keep the "Blame Someone" button, because of course they do.
 */
const props = withDefaults(
  defineProps<{
    state: 'loading' | 'empty' | 'noResults' | 'error'
    errorType?: ErrorType
    query?: string
    platform?: 'mac' | 'ios'
  }>(),
  { errorType: 'generic', query: '', platform: 'mac' },
)
const emit = defineEmits<{ retry: []; home: []; blame: []; clear: [] }>()

const loadingIndex = ref(Math.floor(Math.random() * finderCopy.loading.length))
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  if (props.state === 'loading') {
    timer = setInterval(() => (loadingIndex.value = (loadingIndex.value + 1) % finderCopy.loading.length), 3000)
  }
})
onBeforeUnmount(() => clearInterval(timer))

const loading = computed(() => finderCopy.loading[loadingIndex.value]!)
const error = computed(() => finderCopy.errors[props.errorType])
const errorIcon = computed(
  () => ({ network: Wifi, permission: Lock, notFound: Search, generic: TriangleAlert })[props.errorType],
)
const ios = computed(() => props.platform === 'ios')
</script>

<template>
  <div
    class="flex h-full min-h-60 flex-col items-center justify-center gap-2 px-8 py-10 text-center"
    :class="ios ? 'text-ios-label-secondary' : 'text-label-secondary'"
    :role="state === 'error' ? 'alert' : 'status'"
  >
    <template v-if="state === 'loading'">
      <UiSpinner :size="24" class="mb-2" />
      <p :class="ios ? 'text-ios-headline text-ios-label' : 'text-headline text-label'">{{ loading.title }}</p>
      <p class="max-w-sm" :class="ios ? 'text-ios-footnote' : 'text-callout'">{{ loading.subtitle }}</p>
    </template>

    <template v-else-if="state === 'empty' || state === 'noResults'">
      <component :is="state === 'empty' ? FolderOpen : Search" class="mb-1 size-10 opacity-50" aria-hidden="true" />
      <p :class="ios ? 'text-ios-headline text-ios-label' : 'text-headline text-label'">
        {{ state === 'empty' ? finderCopy.empty.title : finderCopy.noResults.title }}
      </p>
      <p class="max-w-sm" :class="ios ? 'text-ios-footnote' : 'text-callout'">
        {{ state === 'empty' ? finderCopy.empty.body : fill(finderCopy.noResults.body, { q: query }) }}
      </p>
      <UiButton v-if="state === 'noResults'" size="small" class="mt-2" @click="emit('clear')">Clear Search</UiButton>
    </template>

    <template v-else>
      <component :is="errorIcon" class="mb-1 size-10 text-red" aria-hidden="true" />
      <p :class="ios ? 'text-ios-headline text-ios-label' : 'text-headline text-label'">{{ error.title }}</p>
      <p class="max-w-sm" :class="ios ? 'text-ios-footnote' : 'text-body'">{{ error.message }}</p>
      <p
        class="mt-2 max-w-sm rounded-lg px-3 py-2 font-mono"
        :class="ios ? 'bg-ios-fill-quaternary text-ios-caption-1' : 'bg-fill-quaternary text-subheadline'"
      >
        {{ error.technical }}
      </p>
      <div class="mt-3 flex flex-wrap justify-center gap-2">
        <UiButton size="small" @click="emit('retry')">Try Again</UiButton>
        <UiButton size="small" @click="emit('home')">Go Home</UiButton>
        <UiButton size="small" variant="destructive" @click="emit('blame')">Blame Someone</UiButton>
      </div>
    </template>
  </div>
</template>
