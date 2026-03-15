<template>
  <AppLayout>
    <div class="settings">
      <h1>Settings</h1>

      <SettingsSection
        title="General"
        description="Regional preferences for displaying your financial data."
      >
        <form class="settings-form" @submit.prevent="saveCurrency">
          <div class="field">
            <label for="currency">Currency</label>
            <select id="currency" v-model="currencyForm">
              <option v-for="c in CURRENCIES" :key="c.code" :value="c.code">
                {{ c.code }} — {{ c.label }}
              </option>
            </select>
          </div>
          <div class="form-footer">
            <span v-if="currencySaved" class="saved-badge">Saved</span>
            <button class="btn-primary" type="submit" :disabled="prefsStore.loading">
              {{ prefsStore.loading ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </form>
      </SettingsSection>

      <SettingsSection
        title="AI Provider"
        description="Configure the AI provider used to read and categorize your transactions."
      >
        <div v-if="aiStore.loading && !form.provider" class="loading">Loading…</div>

        <form v-else class="settings-form" @submit.prevent="save">
          <div class="field">
            <label for="provider">Provider</label>
            <select id="provider" v-model="form.provider" @change="onProviderChange">
              <option value="">— select a provider —</option>
              <option v-for="p in PROVIDERS" :key="p.value" :value="p.value">{{ p.label }}</option>
            </select>
          </div>

          <div class="field">
            <label for="model">Model</label>
            <input
              id="model"
              v-model="form.model"
              type="text"
              placeholder="e.g. claude-3-5-sonnet-20241022"
              list="model-suggestions"
            />
            <datalist id="model-suggestions">
              <option v-for="m in currentModels" :key="m" :value="m" />
            </datalist>
            <span class="field-hint">
              {{ modelsLoading ? 'Loading models…' : 'You can type any model supported by your provider' }}
            </span>
          </div>

          <ProviderGuide
            v-if="['gemini', 'anthropic', 'openai', 'xai'].includes(form.provider)"
            :provider="form.provider"
          />

          <ApiKeyField v-model="form.apiKey" :has-existing-config="hasExistingConfig" />

          <div class="form-footer">
            <span v-if="saved" class="saved-badge">Saved</span>
            <span v-if="aiStore.error" class="error">{{ aiStore.error }}</span>
            <button class="btn-primary" type="submit" :disabled="aiStore.loading || !canSave">
              {{ aiStore.loading ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </form>
      </SettingsSection>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import SettingsSection from '@/components/settings/SettingsSection.vue'
import ProviderGuide from '@/components/settings/ProviderGuide.vue'
import ApiKeyField from '@/components/settings/ApiKeyField.vue'
import { useAiStore } from '@/stores/ai'
import { aiConfigService } from '@/services/ai-config'
import { usePreferencesStore } from '@/stores/preferences'

const CURRENCIES: { code: string; label: string }[] = [
  { code: 'EUR', label: 'Euro' },
  { code: 'USD', label: 'US Dollar' },
  { code: 'GBP', label: 'British Pound' },
  { code: 'CHF', label: 'Swiss Franc' },
  { code: 'JPY', label: 'Japanese Yen' },
  { code: 'CAD', label: 'Canadian Dollar' },
  { code: 'AUD', label: 'Australian Dollar' },
  { code: 'MXN', label: 'Mexican Peso' },
  { code: 'BRL', label: 'Brazilian Real' },
  { code: 'ARS', label: 'Argentine Peso' },
]

const prefsStore = usePreferencesStore()
const currencyForm = ref('EUR')
const currencySaved = ref(false)

async function saveCurrency() {
  await prefsStore.save({ currency: currencyForm.value })
  currencySaved.value = true
  setTimeout(() => (currencySaved.value = false), 3000)
}

const PROVIDERS = [
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'openai', label: 'OpenAI (GPT)' },
  { value: 'gemini', label: 'Google (Gemini)' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'groq', label: 'Groq' },
  { value: 'xai', label: 'xAI (Grok)' },
  { value: 'ollama', label: 'Ollama (local)' },
]

const aiStore = useAiStore()

const currentModels = ref<string[]>([])
const modelsLoading = ref(false)
const form = ref({ provider: 'gemini', model: '', apiKey: '' })
const saved = ref(false)

const hasExistingConfig = computed(() => !!aiStore.config)
const canSave = computed(
  () => form.value.provider && form.value.model && (form.value.apiKey || hasExistingConfig.value),
)

async function onProviderChange(): Promise<void> {
  modelsLoading.value = true
  form.value.model = ''
  try {
    currentModels.value = await aiConfigService.models(form.value.provider)
    if (currentModels.value.length) form.value.model = currentModels.value[0]
  } finally {
    modelsLoading.value = false
  }
}

async function save(): Promise<void> {
  saved.value = false
  const payload = {
    provider: form.value.provider,
    model: form.value.model,
    ...(form.value.apiKey ? { api_key: form.value.apiKey } : {}),
  }
  try {
    await aiStore.saveConfig(payload)
    form.value.apiKey = ''
    saved.value = true
    setTimeout(() => (saved.value = false), 3000)
  } catch {
    // error shown via aiStore.error
  }
}

onMounted(async () => {
  await Promise.all([aiStore.fetchConfig(), prefsStore.fetch()])

  currencyForm.value = prefsStore.currency

  if (aiStore.config) {
    form.value.provider = aiStore.config.provider
    form.value.model = aiStore.config.model
  }
  await onProviderChange()
})
</script>

<style scoped>
.settings {
  max-width: 560px;
}

.settings h1 {
  margin: 0 0 2rem;
}

.loading {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

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

input,
select {
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
  font-size: 0.9rem;
  width: 100%;
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--accent);
}

.field-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 0.5rem;
}

.saved-badge {
  font-size: 0.875rem;
  color: oklch(0.55 0.15 145);
}

.error {
  font-size: 0.875rem;
  color: var(--error);
}

.btn-primary {
  padding: 0.65rem 1.5rem;
  background: var(--btn-bg);
  color: var(--btn-text);
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: var(--btn-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
