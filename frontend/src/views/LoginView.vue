<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1 class="auth-logo">finity</h1>
      <p class="auth-subtitle">{{ isLogin ? t('auth.signIn') : t('auth.createAccount') }}</p>

      <form class="auth-form" @submit.prevent="submit">
        <div class="field">
          <label for="email">{{ t('auth.email') }}</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="you@example.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="field">
          <label for="password">{{ t('auth.password') }}</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <button type="submit" :disabled="loading">
          {{ loading ? t('auth.loading') : isLogin ? t('auth.loginBtn') : t('auth.registerBtn') }}
        </button>
      </form>

      <p class="auth-switch">
        {{ isLogin ? t('auth.noAccount') : t('auth.haveAccount') }}
        <a href="#" @click.prevent="isLogin = !isLogin">
          {{ isLogin ? t('auth.register') : t('auth.loginBtn') }}
        </a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

async function submit(): Promise<void> {
  error.value = null
  loading.value = true
  try {
    if (isLogin.value) {
      await auth.login(email.value, password.value)
    } else {
      await auth.register(email.value, password.value)
    }
    router.push({ name: 'Dashboard' })
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
}

.auth-card {
  background: var(--card-bg);
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  width: 100%;
  max-width: 380px;
}

.auth-logo {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
  color: var(--text);
}

.auth-subtitle {
  color: var(--text-muted);
  margin: 0 0 1.75rem;
  font-size: 0.95rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
}

input {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--input-border);
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  background: var(--input-bg);
  color: var(--text);
  transition: border-color 0.2s;
}

input:focus {
  border-color: var(--input-border-focus);
}

button {
  margin-top: 0.5rem;
  padding: 0.7rem;
  background: var(--btn-bg);
  color: var(--btn-text);
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background: var(--btn-hover);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: var(--error);
  font-size: 0.875rem;
  margin: 0;
}

.auth-switch {
  margin-top: 1.25rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.auth-switch a {
  color: var(--text);
  font-weight: 500;
}

.auth-switch a:hover {
  text-decoration: underline;
}
</style>
