<template>
  <section class="settings-section">
    <h2>{{ title }}</h2>
    <p class="section-desc">{{ description }}</p>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<style scoped>
.settings-section h2 {
  margin: 0 0 0.375rem;
  font-size: 1.1rem;
}

.section-desc {
  margin: 0 0 1.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}
</style>
