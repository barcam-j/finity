<template>
  <div class="field">
    <label for="api-key">API Key</label>
    <div class="input-row">
      <input
        id="api-key"
        :value="modelValue"
        :type="showKey ? 'text' : 'password'"
        placeholder="Paste your API key"
        autocomplete="off"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button type="button" class="btn-icon" @click="showKey = !showKey">
        {{ showKey ? 'Hide' : 'Show' }}
      </button>
    </div>
    <span v-if="hasExistingConfig && !modelValue" class="field-hint">
      Leave blank to keep the current key
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  modelValue: string
  hasExistingConfig: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showKey = ref(false)
</script>

