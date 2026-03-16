<template>
  <AppLayout>
    <div class="settings">
      <h1>{{ t('settings.title') }}</h1>

      <SettingsSection
        :title="t('settings.generalTitle')"
        :description="t('settings.generalDesc')"
      >
        <div class="settings-form">
          <div class="field">
            <label for="currency">{{ t('settings.currency') }}</label>
            <select id="currency" :value="currencyForm" @change="saveCurrencyOnChange(($event.target as HTMLSelectElement).value)">
              <option v-for="c in CURRENCIES" :key="c.code" :value="c.code">
                {{ c.code }} — {{ c.label }}
              </option>
            </select>
          </div>
          <div class="field">
            <label for="language">{{ t('settings.language') }}</label>
            <select id="language" :value="languageForm" @change="saveLanguage(($event.target as HTMLSelectElement).value)">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="it">Italiano</option>
            </select>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        :title="t('settings.aiProviderTitle')"
        :description="t('settings.aiProviderDesc')"
      >
        <div v-if="aiInitializing" class="loading">{{ t('settings.loading') }}</div>

        <form v-else class="settings-form" @submit.prevent="save">
          <div class="field">
            <label for="provider">{{ t('settings.provider') }}</label>
            <select id="provider" v-model="form.provider" @change="onProviderChange">
              <option value="">{{ t('settings.selectProvider') }}</option>
              <option v-for="p in AI_PROVIDERS" :key="p.value" :value="p.value">{{ p.label }}</option>
            </select>
          </div>

          <div class="field">
            <label for="model">{{ t('settings.model') }}</label>
            <input
              id="model"
              v-model="form.model"
              type="text"
              :placeholder="t('settings.modelPlaceholder')"
              list="model-suggestions"
            />
            <datalist id="model-suggestions">
              <option v-for="m in currentModels" :key="m" :value="m" />
            </datalist>
            <span class="field-hint">
              {{ modelsLoading ? t('settings.loadingModels') : t('settings.modelHint') }}
            </span>
          </div>

          <ProviderGuide
            v-if="PROVIDERS_WITH_GUIDE.includes(form.provider)"
            :provider="form.provider"
          />

          <ApiKeyField v-model="form.apiKey" :has-existing-config="hasExistingConfig" />

          <div class="field field--toggle">
            <label for="analysis-enabled" class="toggle-label">
              <span>
                {{ t('settings.enableAnalysis') }}
                <span class="field-hint">{{ t('settings.enableAnalysisHint') }}</span>
              </span>
              <button
                id="analysis-enabled"
                type="button"
                role="switch"
                :aria-checked="form.analysisEnabled"
                :disabled="togglingAnalysis"
                class="toggle"
                :class="{ 'toggle--on': form.analysisEnabled }"
                @click="toggleAnalysis"
              />
            </label>
          </div>

          <div class="form-footer">
            <span v-if="saved" class="saved-badge">{{ t('settings.saved') }}</span>
            <span v-if="aiError" class="error">{{ aiError }}</span>
            <button class="btn-primary" type="submit" :disabled="aiLoading || !canSave">
              {{ aiLoading ? t('settings.saving') : t('settings.save') }}
            </button>
          </div>
        </form>
      </SettingsSection>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/AppLayout.vue'
import SettingsSection from '@/components/settings/SettingsSection.vue'
import ProviderGuide from '@/components/settings/ProviderGuide.vue'
import ApiKeyField from '@/components/settings/ApiKeyField.vue'
import { CURRENCIES } from '@/constants/currencies'
import { AI_PROVIDERS, PROVIDERS_WITH_GUIDE } from '@/constants/ai-providers'
import { useCurrencyForm } from '@/composables/useCurrencyForm'
import { useAiProviderForm } from '@/composables/useAiProviderForm'

const { t } = useI18n()
const { currencyForm, languageForm, init: initCurrency, saveCurrencyOnChange, saveLanguage } = useCurrencyForm()
const { loading: aiLoading, error: aiError, initializing: aiInitializing, togglingAnalysis, form, currentModels, modelsLoading, hasExistingConfig, canSave, saved, init: initAi, onProviderChange, save, toggleAnalysis } = useAiProviderForm()

onMounted(() => Promise.all([initCurrency(), initAi()]))
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
