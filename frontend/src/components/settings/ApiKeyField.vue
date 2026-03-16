<template>
  <div class="field">
    <label for="api-key">{{ t('settings.apiKey') }}</label>
    <div class="input-row">
      <input
        id="api-key"
        :value="modelValue"
        :type="showKey ? 'text' : 'password'"
        :placeholder="t('settings.apiKeyPlaceholder')"
        autocomplete="off"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button type="button" class="btn-icon" @click="showKey = !showKey">
        {{ showKey ? t('settings.hideKey') : t('settings.showKey') }}
      </button>
    </div>
    <span v-if="hasExistingConfig && !modelValue" class="field-hint">
      {{ t('settings.apiKeyHint') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  modelValue: string
  hasExistingConfig: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showKey = ref(false)
</script>
