<template>
  <div class="field">
    <label for="api-key">
      {{ t('settings.apiKey') }}
      <span v-if="hasExistingConfig && !modelValue" class="key-configured-badge">
        ✓ {{ t('settings.apiKeyConfigured') }}
      </span>
    </label>
    <div class="input-row">
      <input
        id="api-key"
        :value="displayValue"
        :type="showKey ? 'text' : 'password'"
        :placeholder="hasExistingConfig && !modelValue ? t('settings.apiKeyKeepPlaceholder') : t('settings.apiKeyPlaceholder')"
        autocomplete="off"
        @input="onInput"
      />
      <button type="button" class="btn-icon" :disabled="revealing" @click="toggleShow">
        {{ revealing ? '…' : showKey ? t('settings.hideKey') : t('settings.showKey') }}
      </button>
    </div>
    <span v-if="hasExistingConfig && modelValue" class="field-hint">
      {{ t('settings.apiKeyHint') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/services/api'

const { t } = useI18n()

const props = defineProps<{
  modelValue: string
  hasExistingConfig: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showKey = ref(false)
const revealedKey = ref('')
const revealing = ref(false)

const displayValue = computed(() =>
  showKey.value && revealedKey.value && !props.modelValue ? revealedKey.value : props.modelValue,
)

async function toggleShow(): Promise<void> {
  if (!showKey.value && props.hasExistingConfig && !props.modelValue && !revealedKey.value) {
    revealing.value = true
    try {
      const { api_key } = await api.get<{ api_key: string }>('/ai-config/api-key')
      revealedKey.value = api_key
    } finally {
      revealing.value = false
    }
  }
  if (!props.modelValue) showKey.value = !showKey.value
  else showKey.value = !showKey.value
}

function onInput(e: Event): void {
  revealedKey.value = ''
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<style scoped>
.key-configured-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  margin-left: 0.5rem;
  padding: 0.1rem 0.5rem;
  background: oklch(0.92 0.08 145);
  color: oklch(0.38 0.12 145);
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 600;
  vertical-align: middle;
}
</style>
