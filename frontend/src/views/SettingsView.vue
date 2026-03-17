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
          <div class="field field--toggle">
            <label class="toggle-label">
              <span>
                {{ t('settings.allowDateEdit') }}
                <span class="field-hint">{{ t('settings.allowDateEditHint') }}</span>
              </span>
              <button
                type="button"
                role="switch"
                :aria-checked="allowDateEditForm"
                class="toggle"
                :class="{ 'toggle--on': allowDateEditForm }"
                @click="saveAllowDateEdit(!allowDateEditForm)"
              />
            </label>
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

      <SettingsSection
        :title="t('settings.rulesTitle')"
        :description="t('settings.rulesDesc')"
      >
        <div v-if="rulesLoading" class="loading">{{ t('settings.loading') }}</div>
        <div v-else-if="!rules.length" class="rules-empty">{{ t('settings.rulesEmpty') }}</div>
        <div v-else class="rules-list">
          <div v-for="group in rules" :key="group.category" class="rule-group">
            <span class="rule-category">{{ group.category }}</span>
            <div class="rule-patterns">
              <span v-for="rule in group.rules" :key="rule.id" class="rule-chip">
                {{ rule.pattern }}
                <button class="rule-remove" @click="deleteRule(rule.id, group.category)">×</button>
              </span>
            </div>
          </div>
        </div>
      </SettingsSection>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/AppLayout.vue'
import SettingsSection from '@/components/settings/SettingsSection.vue'
import ProviderGuide from '@/components/settings/ProviderGuide.vue'
import ApiKeyField from '@/components/settings/ApiKeyField.vue'
import { CURRENCIES } from '@/constants/currencies'
import { AI_PROVIDERS, PROVIDERS_WITH_GUIDE } from '@/constants/ai-providers'
import { useCurrencyForm } from '@/composables/useCurrencyForm'
import { useAiProviderForm } from '@/composables/useAiProviderForm'
import { categoryRulesService } from '@/services/categoryRules'
import type { CategoryRuleGroup } from '@/services/categoryRules'

const { t } = useI18n()
const { currencyForm, languageForm, allowDateEditForm, init: initCurrency, saveCurrencyOnChange, saveLanguage, saveAllowDateEdit } = useCurrencyForm()
const { loading: aiLoading, error: aiError, initializing: aiInitializing, togglingAnalysis, form, currentModels, modelsLoading, hasExistingConfig, canSave, saved, init: initAi, onProviderChange, save, toggleAnalysis } = useAiProviderForm()

const rules = ref<CategoryRuleGroup[]>([])
const rulesLoading = ref(false)

async function loadRules(): Promise<void> {
  rulesLoading.value = true
  try {
    rules.value = await categoryRulesService.getAll()
  } finally {
    rulesLoading.value = false
  }
}

async function deleteRule(id: string, category: string): Promise<void> {
  await categoryRulesService.delete(id)
  const group = rules.value.find((g) => g.category === category)
  if (group) {
    group.rules = group.rules.filter((r) => r.id !== id)
    if (!group.rules.length) rules.value = rules.value.filter((g) => g.category !== category)
  }
}

onMounted(() => Promise.all([initCurrency(), initAi(), loadRules()]))
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

.rules-empty {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rule-group {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.rule-category {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: capitalize;
  min-width: 8rem;
  padding-top: 0.2rem;
}

.rule-patterns {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.rule-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 99px;
  font-size: 0.78rem;
  color: var(--text);
  font-family: monospace;
}

.rule-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1;
  padding: 0;
  color: var(--text-muted);
  transition: color 0.15s;
}

.rule-remove:hover {
  color: var(--error);
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
