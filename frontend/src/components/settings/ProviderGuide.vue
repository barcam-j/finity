<template>
  <div class="provider-guide">
    <!-- Gemini -->
    <template v-if="provider === 'gemini'">
      <p class="guide-title">{{ t('guide.geminiTitle') }}</p>
      <ol class="guide-steps">
        <i18n-t keypath="guide.step1Go" tag="li">
          <template #link>
            <a href="https://aistudio.google.com" target="_blank" rel="noopener">aistudio.google.com</a>
          </template>
        </i18n-t>
        <i18n-t keypath="guide.geminiStep2" tag="li">
          <template #button><strong>{{ t('guide.geminiGetApiKey') }}</strong></template>
        </i18n-t>
        <i18n-t keypath="guide.geminiStep3" tag="li">
          <template #button><strong>{{ t('guide.geminiCreateApiKey') }}</strong></template>
        </i18n-t>
        <li>{{ t('guide.geminiStep4') }}</li>
      </ol>
      <p class="guide-note">{{ t('guide.geminiNote') }}</p>
    </template>

    <!-- Anthropic -->
    <template v-if="provider === 'anthropic'">
      <p class="guide-title">{{ t('guide.anthropicTitle') }}</p>
      <ol class="guide-steps">
        <i18n-t keypath="guide.anthropicStep1Go" tag="li">
          <template #link>
            <a href="https://console.anthropic.com" target="_blank" rel="noopener">console.anthropic.com</a>
          </template>
        </i18n-t>
        <i18n-t keypath="guide.anthropicStep2" tag="li">
          <template #path><strong>{{ t('guide.anthropicSettingsPath') }}</strong></template>
        </i18n-t>
        <i18n-t keypath="guide.anthropicStep3" tag="li">
          <template #button><strong>{{ t('guide.anthropicCreateKey') }}</strong></template>
        </i18n-t>
        <i18n-t keypath="guide.anthropicStep4" tag="li">
          <template #credits><strong>{{ t('guide.anthropicCredits') }}</strong></template>
          <template #billing><strong>{{ t('guide.anthropicBilling') }}</strong></template>
        </i18n-t>
        <li>{{ t('guide.anthropicStep5') }}</li>
      </ol>
      <i18n-t keypath="guide.anthropicNote" tag="p" class="guide-note">
        <template #code><code>claude-3-5-haiku-20241022</code></template>
      </i18n-t>
    </template>

    <!-- OpenAI -->
    <template v-if="provider === 'openai'">
      <p class="guide-title">{{ t('guide.openaiTitle') }}</p>
      <ol class="guide-steps">
        <i18n-t keypath="guide.openaiStep1Go" tag="li">
          <template #link>
            <a href="https://platform.openai.com" target="_blank" rel="noopener">platform.openai.com</a>
          </template>
        </i18n-t>
        <i18n-t keypath="guide.openaiStep2" tag="li">
          <template #apiKeys><strong>{{ t('guide.openaiApiKeys') }}</strong></template>
        </i18n-t>
        <i18n-t keypath="guide.openaiStep3" tag="li">
          <template #button><strong>{{ t('guide.openaiCreateKey') }}</strong></template>
        </i18n-t>
        <i18n-t keypath="guide.openaiStep4" tag="li">
          <template #billing><strong>{{ t('guide.openaiBilling') }}</strong></template>
        </i18n-t>
        <li>{{ t('guide.openaiStep5') }}</li>
      </ol>
      <i18n-t keypath="guide.openaiNote" tag="p" class="guide-note">
        <template #code><code>gpt-4o-mini</code></template>
      </i18n-t>
    </template>

    <!-- xAI -->
    <template v-if="provider === 'xai'">
      <p class="guide-title">{{ t('guide.xaiTitle') }}</p>
      <ol class="guide-steps">
        <i18n-t keypath="guide.xaiStep1Go" tag="li">
          <template #link>
            <a href="https://console.x.ai" target="_blank" rel="noopener">console.x.ai</a>
          </template>
        </i18n-t>
        <i18n-t keypath="guide.xaiStep2" tag="li">
          <template #apiKeys><strong>{{ t('guide.xaiApiKeys') }}</strong></template>
        </i18n-t>
        <i18n-t keypath="guide.xaiStep3" tag="li">
          <template #button><strong>{{ t('guide.xaiCreateKey') }}</strong></template>
        </i18n-t>
        <i18n-t keypath="guide.xaiStep4" tag="li">
          <template #billing><strong>{{ t('guide.xaiBilling') }}</strong></template>
        </i18n-t>
        <li>{{ t('guide.xaiStep5') }}</li>
      </ol>
      <i18n-t keypath="guide.xaiNote" tag="p" class="guide-note">
        <template #code><code>xai/grok-2-mini</code></template>
      </i18n-t>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  provider: string
}>()
</script>

<style scoped>
.provider-guide {
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

.guide-note code {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.1rem 0.35rem;
  font-size: 0.8rem;
  font-family: monospace;
}
</style>
