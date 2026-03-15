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
              <option v-for="p in AI_PROVIDERS" :key="p.value" :value="p.value">{{ p.label }}</option>
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
            v-if="PROVIDERS_WITH_GUIDE.includes(form.provider)"
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
import { onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import SettingsSection from '@/components/settings/SettingsSection.vue'
import ProviderGuide from '@/components/settings/ProviderGuide.vue'
import ApiKeyField from '@/components/settings/ApiKeyField.vue'
import { CURRENCIES } from '@/constants/currencies'
import { AI_PROVIDERS, PROVIDERS_WITH_GUIDE } from '@/constants/ai-providers'
import { useCurrencyForm } from '@/composables/useCurrencyForm'
import { useAiProviderForm } from '@/composables/useAiProviderForm'

const { prefsStore, currencyForm, currencySaved, init: initCurrency, saveCurrency } = useCurrencyForm()
const { aiStore, form, currentModels, modelsLoading, hasExistingConfig, canSave, saved, init: initAi, onProviderChange, save } = useAiProviderForm()

onMounted(async () => {
  await Promise.all([aiStore.fetchConfig(), prefsStore.fetch()])

  initCurrency(prefsStore.currency)

  if (aiStore.config) {
    initAi(aiStore.config.provider, aiStore.config.model)
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
