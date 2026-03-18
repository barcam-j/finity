<template>
  <AppLayout>
    <div class="settings">
      <nav class="tabs" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          role="tab"
          :aria-selected="activeTab === tab.id"
          class="tab"
          :class="{ 'tab--active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </nav>

      <!-- General -->
      <div v-show="activeTab === 'general'">
        <SettingsSection :description="t('settings.generalDesc')"
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
      </div>

      <!-- AI Provider -->
      <div v-show="activeTab === 'ai'">
        <SettingsSection :description="t('settings.aiProviderDesc')"
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

      <!-- Categorization rules -->
      <div v-show="activeTab === 'categorization'">
        <SettingsSection :description="t('settings.rulesDesc')"
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

      <!-- Data -->
      <div v-show="activeTab === 'data'">
        <SettingsSection :description="t('settings.dataExportDesc')">
          <button class="btn-secondary" :disabled="exporting" @click="exportCsv">
            {{ exporting ? t('settings.loading') : t('settings.dataExportBtn') }}
          </button>
        </SettingsSection>

        <SettingsSection :description="t('settings.dataHistoryDesc')">
          <div v-if="logsLoading" class="loading">{{ t('settings.loading') }}</div>
          <div v-else-if="!importLogs.length" class="rules-empty">{{ t('settings.dataHistoryEmpty') }}</div>
          <table v-else class="logs-table">
            <thead>
              <tr>
                <th>{{ t('settings.dataHistoryDate') }}</th>
                <th>{{ t('settings.dataHistoryName') }}</th>
                <th>{{ t('settings.dataHistorySource') }}</th>
                <th class="col-count">{{ t('settings.dataHistoryCount') }}</th>
                <th class="col-action"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in importLogs" :key="log.id">
                <td>{{ formatLogDate(log.created_at) }}</td>
                <td class="col-name">{{ log.name || '—' }}</td>
                <td><span class="source-badge" :class="`source-badge--${log.source}`">{{ log.source.toUpperCase() }}</span></td>
                <td class="col-count">{{ log.count }}</td>
                <td class="col-action">
                  <button class="btn-row-delete" @click="deleteImportLog(log.id)">✕</button>
                </td>
              </tr>
            </tbody>
          </table>
        </SettingsSection>

        <SettingsSection :description="t('settings.dataDangerDesc')">
          <button class="btn-danger" @click="showDeleteConfirm = true">
            {{ t('settings.dataDangerBtn') }}
          </button>
        </SettingsSection>

        <ConfirmDialog
          :open="showDeleteConfirm"
          :message="t('settings.dataDangerConfirm')"
          :confirm-label="t('settings.dataDangerConfirmBtn')"
          @confirm="confirmDeleteAll"
          @cancel="showDeleteConfirm = false"
        />
      </div>

      <!-- Account -->
      <div v-show="activeTab === 'account'">
        <SettingsSection :description="t('settings.accountDesc')"
        >
          <div class="settings-form">
            <div class="field">
              <label>{{ t('settings.accountEmail') }}</label>
              <p class="account-email">{{ authStore.user?.email }}</p>
            </div>
            <div class="field">
              <label>{{ t('settings.theme') }}</label>
              <div class="theme-group">
                <button
                  v-for="opt in themeOptions"
                  :key="opt.value"
                  type="button"
                  class="theme-option"
                  :class="{ 'theme-option--active': themeStore.theme === opt.value }"
                  @click="themeStore.set(opt.value)"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
          </div>
        </SettingsSection>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
import { dataService } from '@/services/data'
import type { ImportLogItem } from '@/services/data'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const { currencyForm, languageForm, allowDateEditForm, init: initCurrency, saveCurrencyOnChange, saveLanguage, saveAllowDateEdit } = useCurrencyForm()
const { loading: aiLoading, error: aiError, initializing: aiInitializing, togglingAnalysis, form, currentModels, modelsLoading, hasExistingConfig, canSave, saved, init: initAi, onProviderChange, save, toggleAnalysis } = useAiProviderForm()

const tabs = computed(() => [
  { id: 'general', label: t('settings.tabGeneral') },
  { id: 'ai', label: t('settings.tabAi') },
  { id: 'categorization', label: t('settings.tabCategorization') },
  { id: 'data', label: t('settings.tabData') },
  { id: 'account', label: t('settings.tabAccount') },
])

const activeTab = ref('general')

type Theme = 'light' | 'dark' | 'system'

const themeOptions = computed<{ value: Theme; label: string }[]>(() => [
  { value: 'light', label: t('theme.light') },
  { value: 'dark', label: t('theme.dark') },
  { value: 'system', label: t('theme.system') },
])

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

// Data tab
const importLogs = ref<ImportLogItem[]>([])
const logsLoading = ref(false)
const exporting = ref(false)
const showDeleteConfirm = ref(false)

async function loadImportLogs(): Promise<void> {
  logsLoading.value = true
  try {
    importLogs.value = await dataService.getImportLogs()
  } finally {
    logsLoading.value = false
  }
}

async function exportCsv(): Promise<void> {
  exporting.value = true
  try {
    await dataService.exportCsv()
  } finally {
    exporting.value = false
  }
}

async function deleteImportLog(id: string): Promise<void> {
  await dataService.deleteImportLog(id)
  importLogs.value = importLogs.value.filter((l) => l.id !== id)
}

async function confirmDeleteAll(): Promise<void> {
  showDeleteConfirm.value = false
  await dataService.deleteAllData()
  importLogs.value = []
}

function formatLogDate(iso: string): string {
  return new Date(iso).toLocaleString(locale.value, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => Promise.all([initCurrency(), initAi(), loadRules(), loadImportLogs()]))
</script>

<style scoped>
.settings {
  max-width: 560px;
}

.tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border);
  margin-bottom: 2rem;
}

.tab {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 0.6rem 1.1rem;
  font-size: 0.9rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  margin-bottom: -1px;
}

.tab:hover {
  color: var(--text);
}

.tab--active {
  color: var(--accent);
  border-bottom-color: var(--accent);
  font-weight: 500;
}

.account-email {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text);
  padding: 0.5rem 0;
}

.theme-group {
  display: flex;
  gap: 0.5rem;
}

.theme-option {
  padding: 0.45rem 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-muted);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.theme-option:hover {
  border-color: var(--accent);
  color: var(--text);
}

.theme-option--active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  font-weight: 500;
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

.logs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.logs-table th {
  text-align: left;
  padding: 0.35rem 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
  border-bottom: 1px solid var(--border);
}

.logs-table td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border);
  color: var(--text);
}

.logs-table tr:last-child td {
  border-bottom: none;
}

.col-count {
  text-align: right;
}

.col-name {
  color: var(--text);
  font-size: 0.875rem;
}

.col-action {
  width: 2rem;
  text-align: center;
}

.btn-row-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.25rem 0.4rem;
  border-radius: 4px;
  color: var(--text-muted);
  transition: color 0.15s, background 0.15s;
}

.btn-row-delete:hover {
  color: var(--error);
  background: var(--accent-subtle);
}

.source-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: monospace;
}

.source-badge--csv {
  background: oklch(0.92 0.05 220);
  color: oklch(0.35 0.1 220);
}

.source-badge--pdf {
  background: oklch(0.92 0.05 30);
  color: oklch(0.35 0.1 30);
}

.btn-secondary {
  padding: 0.55rem 1.25rem;
  background: none;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 0.9rem;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger {
  padding: 0.55rem 1.25rem;
  background: none;
  border: 1px solid var(--error);
  border-radius: 8px;
  color: var(--error);
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.btn-danger:hover {
  background: var(--error);
  color: #fff;
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
