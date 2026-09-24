<script setup lang="ts">
import { Briefcase, Check, Code, RotateCcw } from '@lucide/vue'

import {
  brewing,
  coffeeTypes,
  form,
  intro,
  meetingTypes,
  personalityTest,
  quickStats,
  topics,
  topicsTitle,
} from '@/content/coffee'
import { profile } from '@/content/profile'
import { UiAppIcon, UiButton, UiIconButton, UiProgress, UiSegmented, UiTextField } from '@/ui'
import { WindowToolbar } from '@/ui/window'

import { useCoffeeBooking } from './useCoffeeBooking'

/**
 * Coffee Chat on the Mac: a single scrolling form in the System Settings
 * idiom (grouped boxes, hairline separators), with the booking buttons pinned
 * to the bottom edge like a sheet's.
 */
const booking = useCoffeeBooking()
const { details, errors } = booking

const meetingOptions = meetingTypes.map((m) => ({ value: m.id, label: `${m.emoji} ${m.label}` }))

const openLink = (url: string) => window.open(url, '_blank', 'noopener,noreferrer')
const emailInstead = () => (window.location.href = booking.mailtoHref.value)
</script>

<template>
  <div class="flex h-full flex-col bg-window-content">
    <WindowToolbar title="Coffee Chat" :subtitle="booking.brewMessage.value">
      <template #trailing>
        <UiIconButton
          :label="brewing.rebrew"
          :disabled="booking.isBrewing.value"
          @click="booking.brew"
        >
          <RotateCcw />
        </UiIconButton>
        <UiIconButton label="LinkedIn" @click="openLink(profile.links.linkedin)">
          <Briefcase />
        </UiIconButton>
        <UiIconButton label="GitHub" @click="openLink(profile.links.github)">
          <Code />
        </UiIconButton>
      </template>
    </WindowToolbar>

    <div class="min-h-0 flex-1 overflow-y-auto">
      <div class="mx-auto flex max-w-[620px] flex-col gap-6 px-6 py-5">
        <!-- Hero: the machine brews a cup every time the app opens -->
        <section class="flex gap-4" aria-live="polite">
          <button
            type="button"
            class="focus-ring h-fit shrink-0 rounded-2xl transition-transform duration-150 active:scale-95 disabled:active:scale-100"
            :title="brewing.rebrewHint"
            :aria-label="brewing.rebrewHint"
            :disabled="booking.isBrewing.value"
            @click="booking.brew"
          >
            <UiAppIcon name="coffee" :size="64" />
          </button>
          <div class="min-w-0 flex-1">
            <h2 class="text-title-2 font-semibold text-label">{{ intro.title }}</h2>
            <p class="mt-1 text-body text-label-secondary">{{ intro.body }}</p>
            <div class="mt-3 flex items-center gap-3">
              <UiProgress class="flex-1" :value="booking.brewProgress.value" label="Brewing" />
              <span class="tabular w-9 text-right text-callout text-label-secondary">
                {{ Math.round(booking.brewProgress.value) }}%
              </span>
            </div>
            <p class="mt-1.5 text-footnote text-label-tertiary">
              {{ booking.isBrewing.value ? booking.brewReading.value : brewing.machine }}
            </p>
          </div>
        </section>

        <dl
          class="grid grid-cols-3 divide-x divide-separator rounded-xl bg-fill-quaternary py-3 text-center"
        >
          <div v-for="stat in quickStats" :key="stat.label" class="flex flex-col-reverse">
            <dt class="text-footnote text-label-secondary">{{ stat.label }}</dt>
            <dd class="tabular text-title-2 font-semibold text-label">{{ stat.value }}</dd>
          </div>
        </dl>

        <!-- Topics -->
        <section>
          <h3 id="topics-title" class="mb-2 text-headline text-label">{{ topicsTitle }}</h3>
          <div
            role="radiogroup"
            aria-labelledby="topics-title"
            class="overflow-clip rounded-xl bg-fill-quaternary"
          >
            <button
              v-for="item in topics"
              :key="item.id"
              type="button"
              role="radio"
              :aria-checked="booking.topicId.value === item.id"
              class="topic focus-ring flex w-full gap-3 border-b border-separator px-3.5 py-3 text-left last:border-b-0"
              @click="booking.pickTopic(item)"
            >
              <span
                class="grid size-8 shrink-0 place-items-center rounded-lg bg-fill-secondary text-title-3"
                aria-hidden="true"
              >
                {{ item.emoji }}
              </span>
              <span class="min-w-0 flex-1">
                <span class="block text-headline text-label">{{ item.title }}</span>
                <span class="mt-0.5 block text-callout text-label-secondary">{{
                  item.description
                }}</span>
                <span class="mt-2 flex flex-wrap gap-1">
                  <span
                    v-for="tag in item.tags"
                    :key="tag"
                    class="rounded-full bg-fill-tertiary px-2 py-px text-footnote text-label-secondary"
                  >
                    {{ tag }}
                  </span>
                </span>
              </span>
              <Check
                class="mt-1 size-4 shrink-0 text-accent"
                :class="booking.topicId.value === item.id ? 'opacity-100' : 'opacity-0'"
                style="stroke-width: 2.5"
                aria-hidden="true"
              />
            </button>
          </div>
        </section>

        <!-- Coffee personality test -->
        <section>
          <h3 id="coffee-title" class="text-headline text-label">{{ personalityTest.title }}</h3>
          <p class="mb-2 text-callout text-label-secondary">{{ personalityTest.subtitle }}</p>
          <div role="radiogroup" aria-labelledby="coffee-title" class="grid grid-cols-3 gap-2">
            <button
              v-for="item in coffeeTypes"
              :key="item.id"
              type="button"
              role="radio"
              :aria-checked="booking.coffeeId.value === item.id"
              class="cup focus-ring flex flex-col items-center gap-0.5 rounded-xl bg-fill-quaternary px-2 py-3 text-center"
              @click="booking.pickCoffee(item)"
            >
              <span class="text-title-1" aria-hidden="true">{{ item.emoji }}</span>
              <span class="text-headline text-label">{{ item.name }}</span>
              <span class="text-footnote text-label-secondary">{{ item.personality }}</span>
            </button>
          </div>
          <p
            class="mt-2 rounded-xl px-3.5 py-2.5 text-callout"
            :class="
              booking.coffee.value
                ? 'bg-accent-soft text-label'
                : 'bg-fill-quaternary text-label-tertiary'
            "
            aria-live="polite"
          >
            {{ booking.coffee.value?.analysis ?? personalityTest.placeholder }}
          </p>
        </section>

        <!-- The form -->
        <section>
          <h3 class="text-headline text-label">{{ form.title }}</h3>
          <p class="mb-3 text-callout text-label-secondary">{{ form.subtitle }}</p>
          <div class="grid grid-cols-2 gap-x-4 gap-y-3">
            <UiTextField
              v-model="details.name"
              :label="form.name.label"
              :placeholder="form.name.placeholder"
              :error="errors.name"
              @update:model-value="booking.clearError('name')"
            />
            <UiTextField
              v-model="details.email"
              type="email"
              :label="form.email.label"
              :placeholder="form.email.placeholder"
              :error="errors.email"
              @update:model-value="booking.clearError('email')"
            />
            <UiTextField
              v-model="details.when"
              type="datetime-local"
              class="col-span-2"
              :label="form.when.label"
              :hint="form.when.hint"
            />
            <div class="col-span-2 flex flex-col gap-1">
              <span class="text-callout font-medium text-label-secondary">{{
                form.meetingType
              }}</span>
              <UiSegmented
                v-model="details.meetingType"
                :options="meetingOptions"
                :label="form.meetingType"
                class="w-full"
              />
            </div>
            <UiTextField
              v-model="details.message"
              multiline
              :rows="4"
              class="col-span-2"
              :label="form.message.label"
              :placeholder="form.message.placeholder"
            />
          </div>
        </section>
      </div>
    </div>

    <footer
      class="chrome flex shrink-0 items-center gap-3 border-t border-separator bg-window px-5 py-3"
    >
      <p class="min-w-0 flex-1 text-footnote text-label-tertiary">{{ form.reassurance }}</p>
      <UiButton @click="emailInstead">{{ form.emailInstead }}</UiButton>
      <UiButton variant="primary" :state="booking.state.value" @click="booking.book">
        {{ form.submit }}
      </UiButton>
    </footer>
  </div>
</template>

<style scoped>
.topic,
.cup {
  transition: background-color var(--dur-micro) var(--ease-out);
}
.topic:hover,
.cup:hover {
  background: var(--fill-tertiary);
}
.topic:active,
.cup:active {
  background: var(--fill-secondary);
}
.topic[aria-checked='true'] {
  background: var(--accent-soft);
}
.cup[aria-checked='true'] {
  background: var(--accent-soft);
  box-shadow: inset 0 0 0 2px var(--accent);
}
.topic:focus-visible,
.cup:focus-visible {
  outline-offset: -3px;
}
</style>
