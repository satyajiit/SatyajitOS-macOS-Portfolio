import { reactive } from 'vue'

import type { AppId } from '@/apps/registry'

/**
 * Where each Dock icon sits on screen (centre point, viewport px). Windows
 * minimise into, and restore out of, these points.
 */
export const dockTargets = reactive(new Map<AppId, { x: number; y: number }>())

/** Windows that were minimised, so they know to restore out of the Dock. */
export const minimizedFromDock = new Set<AppId>()
