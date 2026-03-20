<template>
  <div class="lang-switcher">
    <button
      v-for="lang in langs"
      :key="lang.code"
      class="lang-btn"
      :class="{ active: locale === lang.code }"
      @click="select(lang.code)"
    >
      {{ lang.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/i18n'

const emit = defineEmits<{ change: [lang: string] }>()

const { locale } = useI18n()

const langs = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'it', label: 'IT' },
]

function select(code: string): void {
  setLocale(code)
  emit('change', code)
}
</script>

<style scoped>
.lang-switcher {
  display: flex;
  gap: 0.1rem;
}

.lang-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  color: var(--text-muted);
  transition: color 0.15s, background 0.15s;
}

.lang-btn:hover {
  color: var(--text);
  background: var(--bg-hover);
}

.lang-btn.active {
  color: var(--accent);
}
</style>
