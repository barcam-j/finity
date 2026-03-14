<template>
  <AppLayout>
    <div class="settings">
      <h1>Settings</h1>

      <section class="settings-section">
        <h2>AI Provider</h2>
        <p class="section-desc">
          Configure the AI provider used to read and categorize your transactions.
        </p>

        <div v-if="aiStore.loading && !form.provider" class="loading">Loading…</div>

        <form v-else class="settings-form" @submit.prevent="save">
          <!-- Provider -->
          <div class="field">
            <label for="provider">Provider</label>
            <select id="provider" v-model="form.provider" @change="onProviderChange">
              <option value="">— select a provider —</option>
              <option v-for="p in PROVIDERS" :key="p.value" :value="p.value">{{ p.label }}</option>
            </select>
          </div>

          <!-- Model -->
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
            <span class="field-hint">You can type any model supported by your provider</span>
          </div>

          <!-- Gemini guide -->
          <div v-if="form.provider === 'gemini'" class="gemini-guide">
            <p class="guide-title">How to get your Gemini API key</p>
            <ol class="guide-steps">
              <li>
                Go to
                <a href="https://aistudio.google.com" target="_blank" rel="noopener">
                  aistudio.google.com
                </a>
                and sign in with your Google account
              </li>
              <li>Click <strong>Get API key</strong> in the left sidebar</li>
              <li>Click <strong>Create API key</strong> and select or create a project</li>
              <li>Copy the generated key and paste it below</li>
            </ol>
            <p class="guide-note">Free tier includes generous usage limits — no credit card required.</p>
          </div>

          <!-- API Key -->
          <div class="field">
            <label for="api-key">API Key</label>
            <div class="input-row">
              <input
                id="api-key"
                v-model="form.apiKey"
                :type="showKey ? 'text' : 'password'"
                placeholder="Paste your API key"
                autocomplete="off"
              />
              <button type="button" class="btn-icon" @click="showKey = !showKey">
                {{ showKey ? 'Hide' : 'Show' }}
              </button>
            </div>
            <span v-if="hasExistingConfig && !form.apiKey" class="field-hint">
              Leave blank to keep the current key
            </span>
          </div>

          <div class="form-footer">
            <span v-if="saved" class="saved-badge">Saved</span>
            <span v-if="aiStore.error" class="error">{{ aiStore.error }}</span>
            <button class="btn-primary" type="submit" :disabled="aiStore.loading || !canSave">
              {{ aiStore.loading ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { useAiStore } from '@/stores/ai'

const PROVIDERS = [
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'openai', label: 'OpenAI (GPT)' },
  { value: 'gemini', label: 'Google (Gemini)' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'groq', label: 'Groq' },
  { value: 'ollama', label: 'Ollama (local)' },
]

const MODELS = {
  anthropic: [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
  ],
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  gemini: ['gemini/gemini-1.5-pro', 'gemini/gemini-1.5-flash', 'gemini/gemini-2.0-flash'],
  mistral: ['mistral/mistral-large-latest', 'mistral/mistral-small-latest'],
  groq: ['groq/llama-3.3-70b-versatile', 'groq/llama-3.1-8b-instant'],
  ollama: ['ollama/llama3.2', 'ollama/mistral', 'ollama/phi3'],
}

const aiStore = useAiStore()

const form = ref({ provider: 'gemini', model: MODELS.gemini[0], apiKey: '' })
const showKey = ref(false)
const saved = ref(false)

const hasExistingConfig = computed(() => !!aiStore.config)
const currentModels = computed(() => MODELS[form.value.provider] ?? [])
const canSave = computed(
  () => form.value.provider && form.value.model && (form.value.apiKey || hasExistingConfig.value),
)

function onProviderChange() {
  const suggestions = MODELS[form.value.provider]
  if (suggestions?.length) form.value.model = suggestions[0]
  else form.value.model = ''
}

async function save() {
  saved.value = false
  const payload = {
    provider: form.value.provider,
    model: form.value.model,
    ...(form.value.apiKey ? { api_key: form.value.apiKey } : {}),
    params: {},
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
  await aiStore.fetchConfig()
  if (aiStore.config) {
    form.value.provider = aiStore.config.provider
    form.value.model = aiStore.config.model
  }
})
</script>

<style scoped>
.settings {
  max-width: 560px;
}

.settings h1 {
  margin: 0 0 2rem;
}

.settings-section h2 {
  margin: 0 0 0.375rem;
  font-size: 1.1rem;
}

.section-desc {
  margin: 0 0 1.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
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

.input-row {
  display: flex;
  gap: 0.5rem;
}

.input-row input {
  flex: 1;
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

.gemini-guide {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem 1.1rem;
  font-size: 0.875rem;
}

.guide-title {
  margin: 0 0 0.75rem;
  font-weight: 600;
  color: var(--text);
}

.guide-steps {
  margin: 0 0 0.75rem;
  padding-left: 1.25rem;
  color: var(--text);
  line-height: 1.8;
}

.guide-steps a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.guide-note {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.8rem;
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
