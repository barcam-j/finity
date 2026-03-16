<template>
  <div v-if="visible" class="ai-banner">
    <div class="ai-banner__body">
      <span class="ai-banner__icon">⚡</span>
      <div>
        <strong>{{ t('aiBanner.title') }}</strong>
        <p>
          <i18n-t keypath="aiBanner.body" tag="span">
            <template #0>
              <a href="https://aistudio.google.com" target="_blank" rel="noopener">{{ t('aiBanner.googleAiStudio') }}</a>
            </template>
            <template #1>
              <RouterLink to="/settings">{{ t('aiBanner.settings') }}</RouterLink>
            </template>
          </i18n-t>
        </p>
      </div>
    </div>
    <button class="ai-banner__close" :aria-label="t('aiBanner.title')" @click="dismiss">✕</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAiStore } from '@/stores/ai'

const { t } = useI18n()
const DISMISSED_KEY = 'ai-banner-dismissed'

const aiStore = useAiStore()
const visible = ref(false)

onMounted(async () => {
  if (sessionStorage.getItem(DISMISSED_KEY)) return
  await aiStore.fetchConfig()
  visible.value = !aiStore.config
})

function dismiss(): void {
  visible.value = false
  sessionStorage.setItem(DISMISSED_KEY, '1')
}
</script>

<style scoped>
.ai-banner {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1rem;
  background: var(--accent-subtle);
  border: 1px solid var(--accent);
  border-radius: 10px;
  font-size: 0.875rem;
}

.ai-banner__body {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.ai-banner__icon {
  font-size: 1.1rem;
  flex-shrink: 0;
  margin-top: 1px;
}

.ai-banner__body strong {
  display: block;
  margin-bottom: 0.2rem;
  color: var(--text);
}

.ai-banner__body p {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.5;
}

.ai-banner__body a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.ai-banner__close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.1rem 0.25rem;
  flex-shrink: 0;
  line-height: 1;
}

.ai-banner__close:hover {
  color: var(--text);
}
</style>
