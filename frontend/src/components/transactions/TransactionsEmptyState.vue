<template>
  <div class="state-msg">
    {{ t('transactions.empty') }}
    <button class="link-btn" @click="emit('import')">{{ t('transactions.importFile') }}</button>
    {{ t('transactions.toGetStarted') }}
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emit = defineEmits<{
  import: []
}>()
</script>

<style scoped>
.state-msg {
  color: var(--text-muted);
  font-size: 0.95rem;
  padding: 2rem 0;
}

.link-btn {
  background: none;
  border: none;
  color: var(--accent);
  cursor: pointer;
  font-size: inherit;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
