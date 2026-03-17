<template>
  <section class="settings-section">
    <p v-if="description" class="section-desc">{{ description }}</p>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  description?: string
}>()
</script>

<style scoped>
.section-desc {
  margin: 0 0 1.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}
</style>
