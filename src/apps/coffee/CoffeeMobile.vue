<script setup lang="ts">
import { Check, RotateCcw } from '@lucide/vue'

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
import { Glyph, IconText, IosButton, IosNavBar, UiAppIcon, UiListGroup, UiListRow, UiProgress, UiTextField } from '@/ui'

import { useCoffeeBooking } from './useCoffeeBooking'

/** Coffee Chat on the phone: a grouped form with the book button docked at the bottom. */
const booking = useCoffeeBooking()
const { details, errors } = booking

const emailInstead = () => (window.location.href = booking.mailtoHref.value)
</script>

<template>
  <div class="flex h-full flex-col bg-ios-grouped">
    <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <IosNavBar title="Coffee Chat" large>
        <template #trailing>
          <button
            type="button"
            class="focus-ring grid size-11 place-items-center rounded-full text-accent active:opacity-50 disabled:opacity-30"
            :aria-label="brewing.rebrew"
            :disabled="booking.isBrewing.value"
            @click="booking.brew"
          >
            <RotateCcw class="size-[22px]" aria-hidden="true" />
          </button>
        </template>
      </IosNavBar>

      <!-- Hero card with the capsule machine -->
      <section class="mx-4 mb-4 rounded-ios-card bg-ios-grouped-secondary p-5" aria-live="polite">
        <div class="flex items-start gap-4">
          <button
            type="button"
            class="focus-ring shrink-0 rounded-2xl transition-transform duration-150 active:scale-95"
            :aria-label="brewing.rebrewHint"
            :disabled="booking.isBrewing.value"
            @click="booking.brew"
          >
            <UiAppIcon name="coffee" :size="56" />
          </button>
          <div class="min-w-0">
            <h2 class="text-ios-headline text-ios-label"><IconText :text="intro.title" /></h2>
            <p class="mt-1 text-ios-subheadline text-ios-label-secondary"><IconText :text="intro.body" /></p>
          </div>
        </div>
        <UiProgress class="mt-4" :value="booking.brewProgress.value" label="Brewing" />
        <p class="mt-2 text-ios-footnote text-ios-label"><IconText :text="booking.brewMessage.value" /></p>
        <p class="text-ios-caption-1 text-ios-label-secondary">
          <IconText :text="booking.isBrewing.value ? booking.brewReading.value : brewing.machine" />
        </p>
      </section>

      <dl class="mx-4 mb-8 grid grid-cols-3 gap-2">
        <div
          v-for="stat in quickStats"
          :key="stat.label"
          class="flex flex-col-reverse justify-end rounded-ios-group bg-ios-grouped-secondary px-3 py-3 text-center"
        >
          <dt class="text-ios-caption-1 text-ios-label-secondary"><IconText :text="stat.label" /></dt>
          <dd class="tabular text-ios-title-3 font-bold text-ios-label">{{ stat.value }}</dd>
        </div>
      </dl>

      <UiListGroup :header="topicsTitle">
        <li v-for="item in topics" :key="item.id" class="topic-row">
          <button
            type="button"
            class="topic focus-ring flex w-full gap-3 py-3 pl-4 text-left"
            :aria-pressed="booking.topicId.value === item.id"
            @click="booking.pickTopic(item)"
          >
            <span class="w-7 shrink-0 pt-0.5 text-center text-ios-title-3" aria-hidden="true">
              <Glyph :name="item.icon" />
            </span>
            <span class="body flex min-w-0 flex-1 gap-2 pr-4">
              <span class="min-w-0 flex-1">
                <span class="block text-ios-headline text-ios-label"><IconText :text="item.title" /></span>
                <span class="mt-0.5 block text-ios-footnote text-ios-label-secondary">
                  <IconText :text="item.description" />
                </span>
                <span class="mt-2 flex flex-wrap gap-1">
                  <span
                    v-for="tag in item.tags"
                    :key="tag"
                    class="rounded-full bg-ios-fill-tertiary px-2 py-0.5 text-ios-caption-2 text-ios-label-secondary"
                  >
                    {{ tag }}
                  </span>
                </span>
              </span>
              <Check
                class="mt-0.5 size-5 shrink-0 text-accent"
                :class="booking.topicId.value === item.id ? 'opacity-100' : 'opacity-0'"
                style="stroke-width: 2.6"
                aria-hidden="true"
              />
            </span>
          </button>
        </li>
      </UiListGroup>

      <UiListGroup
        :header="personalityTest.title"
        :footer="booking.coffee.value?.analysis ?? personalityTest.subtitle"
      >
        <UiListRow
          v-for="item in coffeeTypes"
          :key="item.id"
          :title="item.name"
          :subtitle="item.personality"
          tint="var(--ios-fill-tertiary)"
          interactive
          @select="booking.pickCoffee(item)"
        >
          <template #icon>
            <span class="text-ios-body" aria-hidden="true"><Glyph :name="item.icon" /></span>
          </template>
          <template #accessory>
            <Check
              class="size-5 shrink-0 text-accent"
              :class="booking.coffeeId.value === item.id ? 'opacity-100' : 'opacity-0'"
              style="stroke-width: 2.6"
              :aria-label="booking.coffeeId.value === item.id ? 'Selected' : undefined"
            />
          </template>
        </UiListRow>
      </UiListGroup>

      <section class="mx-4 mb-6 flex flex-col gap-4" aria-labelledby="form-title">
        <div class="px-4">
          <h2 id="form-title" class="text-ios-title-3 font-semibold text-ios-label">
            <IconText :text="form.title" />
          </h2>
          <p class="text-ios-footnote text-ios-label-secondary"><IconText :text="form.subtitle" /></p>
        </div>
        <UiTextField
          v-model="details.name"
          platform="ios"
          :label="form.name.label"
          :placeholder="form.name.placeholder"
          :error="errors.name"
          @update:model-value="booking.clearError('name')"
        />
        <UiTextField
          v-model="details.email"
          platform="ios"
          type="email"
          :label="form.email.label"
          :placeholder="form.email.placeholder"
          :error="errors.email"
          @update:model-value="booking.clearError('email')"
        />
        <UiTextField
          v-model="details.when"
          platform="ios"
          type="datetime-local"
          :label="form.when.label"
          :hint="form.when.hint"
        />
        <fieldset class="flex flex-col gap-1.5">
          <legend class="mb-1.5 text-callout font-medium text-label-secondary">
            <IconText :text="form.meetingType" />
          </legend>
          <div role="radiogroup" :aria-label="form.meetingType" class="grid grid-cols-2 gap-2">
            <button
              v-for="type in meetingTypes"
              :key="type.id"
              type="button"
              role="radio"
              :aria-checked="details.meetingType === type.id"
              class="meeting focus-ring flex h-12 items-center gap-2 rounded-xl bg-ios-grouped-secondary px-3 text-ios-subheadline text-ios-label"
              @click="details.meetingType = type.id"
            >
              <span aria-hidden="true"><Glyph :name="type.icon" /></span>
              <span class="truncate"><IconText :text="type.label" /></span>
            </button>
          </div>
        </fieldset>
        <UiTextField
          v-model="details.message"
          platform="ios"
          multiline
          :rows="4"
          :label="form.message.label"
          :placeholder="form.message.placeholder"
        />
        <p class="px-4 text-center text-ios-footnote text-ios-label-secondary">
          <IconText :text="form.reassurance" />
        </p>
      </section>
    </div>

    <footer
      class="material-ios-bar flex shrink-0 flex-col gap-1 border-t border-ios-separator px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3"
    >
      <IosButton :state="booking.state.value" loading-label="Booking" @click="booking.book">
        <IconText :text="form.submit" />
      </IosButton>
      <button
        type="button"
        class="focus-ring h-11 rounded-xl text-ios-body text-accent active:opacity-50"
        @click="emailInstead"
      >
        <IconText :text="form.emailInstead" />
      </button>
    </footer>
  </div>
</template>

<style scoped>

.topic {
  transition: background-color var(--dur-micro) var(--ease-out);
}
.topic:active {
  background: var(--ios-fill-tertiary);
}
.topic:focus-visible {
  outline-offset: -3px;
}
.topic .body {
  border-bottom: 0.5px solid var(--ios-separator);
  padding-bottom: 12px;
  margin-bottom: -12px;
}
.topic-row:last-child .body {
  border-bottom: none;
}
.meeting {
  transition: background-color var(--dur-micro) var(--ease-out);
}
.meeting:active {
  background: var(--ios-fill-tertiary);
}
.meeting[aria-checked='true'] {
  box-shadow: inset 0 0 0 2px var(--accent);
  background: var(--accent-soft);
}
</style>
