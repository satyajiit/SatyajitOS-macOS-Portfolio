<script setup lang="ts">
import { X } from '@lucide/vue'
import { computed } from 'vue'

import { getApp } from '@/apps/registry'
import { relativeTime, useClock } from '@/composables/useClock'
import type { NotificationAction, OsNotification } from '@/stores/notifications'
import UiAppIcon from '@/ui/UiAppIcon.vue'
import UiButton from '@/ui/UiButton.vue'

/**
 * One notification, drawn like macOS: app icon, bold title, body, relative
 * time, a close button that appears on hover, and actions under the text.
 */
const props = defineProps<{ notification: OsNotification }>()
const emit = defineEmits<{ dismiss: []; act: [action?: NotificationAction] }>()

const { now } = useClock()
const icon = computed(() => (props.notification.app ? getApp(props.notification.app)?.icon : undefined) ?? 'brand')
const time = computed(() => relativeTime(props.notification.createdAt, now.value))
// Clicking the banner itself opens the app behind it (never runs e.g. "Undo").
const primary = computed<NotificationAction | undefined>(
  () =>
    props.notification.actions?.find((a) => a.openApp) ??
    (props.notification.app ? { label: 'Open', openApp: props.notification.app } : undefined),
)
</script>

<template>
  <article
    class="card material-notification relative flex rounded-notification p-3"
    :aria-label="`${notification.title}. ${notification.body}`"
  >
    <button
      type="button"
      class="close"
      aria-label="Dismiss notification"
      @click.stop="emit('dismiss')"
    >
      <X aria-hidden="true" />
    </button>

    <div class="flex min-w-0 flex-1 flex-col gap-2">
      <button
        type="button"
        class="body flex min-w-0 gap-3 text-left"
        @click="emit('act', primary)"
      >
        <UiAppIcon :name="icon" :size="34" :shadow="false" class="mt-0.5" />
        <span class="min-w-0 flex-1">
          <span class="flex items-baseline justify-between gap-2">
            <span class="truncate text-headline text-label">{{ notification.title }}</span>
            <span class="shrink-0 text-subheadline text-label-secondary">{{ time }}</span>
          </span>
          <span v-if="notification.body" class="clamp mt-0.5 block text-body text-label">
            {{ notification.body }}
          </span>
        </span>
      </button>

      <div v-if="notification.actions?.length" class="flex justify-end gap-1.5">
        <UiButton
          v-for="action in notification.actions"
          :key="action.label"
          size="small"
          @click.stop="emit('act', action)"
        >
          {{ action.label }}
        </UiButton>
      </div>
    </div>
  </article>
</template>

<style scoped>
.card {
  width: 100%;
}
.body {
  border-radius: calc(var(--radius-notification) - 8px);
}
.body:focus-visible {
  outline: 3px solid var(--focus-ring);
}
.clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.close {
  position: absolute;
  top: -6px;
  left: -6px;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: var(--tint-notification);
  box-shadow: var(--elev-control);
  color: var(--label-secondary);
  backdrop-filter: blur(var(--blur-md));
  opacity: 0;
  transition: opacity var(--dur-micro) var(--ease-out);
}
.close svg {
  width: 11px;
  height: 11px;
  stroke-width: 2.5;
}
.card:hover .close,
.close:focus-visible {
  opacity: 1;
}
.close:hover {
  color: var(--label);
}
.close:active {
  background: var(--fill);
}
.close:focus-visible {
  outline: 3px solid var(--focus-ring);
}
</style>
