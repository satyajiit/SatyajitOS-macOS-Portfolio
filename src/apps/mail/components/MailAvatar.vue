<script setup lang="ts">
import { computed } from 'vue'

import { owner } from '@/content/mail'
import { profile } from '@/content/profile'
import BrandIcon from '@/ui/brand/BrandIcon.vue'
import type { BrandName } from '@/ui/brand/registry'

import { initials } from '../format'

/**
 * Contact picture: the owner's photo on their own mail, the brand logo for
 * verified senders, and a grey monogram for everyone else.
 */
const props = withDefaults(defineProps<{ name: string; address: string; brand?: BrandName; size?: number }>(), {
  size: 40,
})
const isOwner = computed(() => props.address === owner.address)
const box = computed(() => ({ width: `${props.size}px`, height: `${props.size}px` }))
</script>

<template>
  <img
    v-if="isOwner"
    :src="profile.avatar"
    alt=""
    class="shrink-0 rounded-full object-cover"
    :style="box"
  />
  <span v-else-if="brand" class="plate shrink-0" :style="box" :aria-label="name" role="img">
    <BrandIcon :name="brand" :size="Math.round(size * 0.56)" decorative class="text-black" />
  </span>
  <span
    v-else
    class="monogram shrink-0"
    :style="{ ...box, fontSize: `${Math.round(size * 0.4)}px` }"
    aria-hidden="true"
  >
    {{ initials(name) }}
  </span>
</template>

<style scoped>
/* Brand avatar: logo on a white disc with a hairline, readable in both appearances. */
.plate {
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: var(--brand-plate);
  box-shadow: inset 0 0 0 0.5px var(--separator);
}

/* The Contacts monogram: soft grey gradient, white initials. */
.monogram {
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: var(--label-on-accent);
  font-weight: 600;
  letter-spacing: 0.02em;
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--sys-gray) 72%, var(--knob)),
    var(--sys-gray)
  );
}
</style>
