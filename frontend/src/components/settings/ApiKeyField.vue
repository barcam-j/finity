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

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
}

.input-row {
  display: flex;
  gap: 0.5rem;
}

.input-row input {
  flex: 1;
}

input {
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
  font-size: 0.9rem;
  width: 100%;
}

input:focus {
  outline: none;
  border-color: var(--accent);
}

.field-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.btn-icon {
  padding: 0.55rem 0.75rem;
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.2s, color 0.2s;
}

.btn-icon:hover {
  border-color: var(--text);
  color: var(--text);
}
</style>
