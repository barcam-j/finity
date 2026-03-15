<template>
  <div class="state-msg">
    No transactions yet.
    <button class="link-btn" @click="emit('import')">Import a file</button>
    to get started.
  </div>
</template>

<script setup lang="ts">
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
