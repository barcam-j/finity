<template>
  <AppLayout>
    <h1>{{ t('analysisView.title') }}</h1>
    <p>{{ t('analysisView.comingSoon') }}</p>
  </AppLayout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/AppLayout.vue'

const { t } = useI18n()
</script>
