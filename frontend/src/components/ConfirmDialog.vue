<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="open" class="backdrop" @mousedown.self="emit('cancel')">
        <div class="dialog" role="dialog" aria-modal="true">
          <p class="dialog-message">{{ message }}</p>
          <div class="dialog-actions">
            <button class="btn-cancel" @click="emit('cancel')">{{ t('transactions.cancel') }}</button>
            <button class="btn-confirm" @click="emit('confirm')">{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  open: boolean
  message: string
  confirmLabel?: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: oklch(0 0 0 / 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  width: min(22rem, 90vw);
  box-shadow: 0 8px 32px oklch(0 0 0 / 0.2);
}

.dialog-message {
  margin: 0 0 1.25rem;
  font-size: 0.95rem;
  color: var(--text);
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-cancel {
  padding: 0.45rem 1rem;
  background: none;
  border: 1px solid var(--border);
  border-radius: 7px;
  color: var(--text-muted);
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.15s;
}

.btn-cancel:hover { color: var(--text); }

.btn-confirm {
  padding: 0.45rem 1rem;
  background: var(--error);
  border: none;
  border-radius: 7px;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-confirm:hover { opacity: 0.85; }

.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-enter-active .dialog,
.dialog-leave-active .dialog {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .dialog,
.dialog-leave-to .dialog {
  transform: scale(0.95);
  opacity: 0;
}
</style>
