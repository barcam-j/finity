<template>
  <div class="importer-selector">
    <div v-if="!active">
      <h3>Select import format</h3>
      <div class="importer-grid">
        <button
          v-for="importer in importers"
          :key="importer.id"
          class="importer-card"
          @click="active = importer"
        >
          <span class="importer-card__label">{{ importer.label }}</span>
          <span class="importer-card__desc">{{ importer.description }}</span>
        </button>
      </div>
    </div>

    <div v-else>
      <button class="back-btn" @click="active = null">← Back</button>
      <h3>{{ active.label }}</h3>
      <component :is="active.component" @done="onDone" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import importers from './index.js'

const emit = defineEmits(['done'])

const active = ref(null)

function onDone() {
  active.value = null
  emit('done')
}
</script>

<style scoped>
.importer-selector {
  width: 100%;
}

.importer-selector h3 {
  margin: 0 0 1.25rem;
}

.importer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.importer-card {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 1.25rem;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.importer-card:hover {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-subtle);
}

.importer-card__label {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text);
}

.importer-card__desc {
  font-size: 0.825rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.back-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0;
  margin-bottom: 1rem;
  transition: color 0.15s;
}

.back-btn:hover {
  color: var(--text);
}
</style>
