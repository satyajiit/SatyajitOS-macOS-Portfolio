<script setup lang="ts">
import { Search, X } from '@lucide/vue'
import { ref } from 'vue'

/** Rounded search field with magnifier and clear button (Esc also clears). */
const query = defineModel<string>({ default: '' })
withDefaults(defineProps<{ placeholder?: string; platform?: 'mac' | 'ios' }>(), {
  placeholder: 'Search',
  platform: 'mac',
})
const input = ref<HTMLInputElement | null>(null)
const clear = () => {
  query.value = ''
  input.value?.focus()
}
defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <label class="search" :class="`is-${platform}`">
    <Search class="icon" aria-hidden="true" />
    <input
      ref="input"
      v-model="query"
      type="search"
      :placeholder="placeholder"
      :aria-label="placeholder"
      autocomplete="off"
      spellcheck="false"
      @keydown.esc="clear"
    />
    <button v-if="query" type="button" class="clear" aria-label="Clear search" @click="clear">
      <X aria-hidden="true" />
    </button>
  </label>
</template>

<style scoped>
.search {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 7px;
  border-radius: var(--radius-field);
  background: var(--fill-tertiary);
  color: var(--label-secondary);
  transition: background-color var(--dur-micro) var(--ease-out);
}
.is-ios {
  height: 36px;
  padding: 0 8px;
  border-radius: 10px;
  background: var(--ios-fill-tertiary);
  font-size: var(--text-ios-body);
}
.search:hover {
  background: var(--fill-secondary);
}
.is-ios:hover {
  background: var(--ios-fill-tertiary);
}
.search:focus-within {
  outline: 3px solid var(--focus-ring);
  background: var(--text-background);
}
.is-ios:focus-within {
  outline: none;
  background: var(--ios-fill-tertiary);
}
.icon {
  width: 14px;
  height: 14px;
  flex: none;
}
.is-ios .icon {
  width: 17px;
  height: 17px;
}
input {
  flex: 1;
  min-width: 0;
  background: transparent;
  color: var(--label);
  font-size: inherit;
  outline: none;
}
input::-webkit-search-cancel-button {
  display: none;
}
.clear {
  display: grid;
  place-items: center;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: var(--label-tertiary);
  color: var(--window-content);
}
.clear svg {
  width: 10px;
  height: 10px;
  stroke-width: 3;
}
.clear:hover {
  background: var(--label-secondary);
}
</style>
