<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1 class="auth-logo">finity</h1>
      <p class="auth-subtitle">{{ isLogin ? 'Sign in to your account' : 'Create your account' }}</p>

      <form class="auth-form" @submit.prevent="submit">
        <div class="field">
          <label for="email">Email</label>
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
          <label for="password">Password</label>
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
          {{ loading ? 'Loading...' : isLogin ? 'Sign in' : 'Create account' }}
        </button>
      </form>

      <p class="auth-switch">
        {{ isLogin ? "Don't have an account?" : 'Already have an account?' }}
        <a href="#" @click.prevent="isLogin = !isLogin">
          {{ isLogin ? 'Register' : 'Sign in' }}
        </a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const error = ref(null)
const loading = ref(false)

async function submit() {
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
    error.value = e.message
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
  background: #f5f5f5;
}

.auth-card {
  background: #fff;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 380px;
}

.auth-logo {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
}

.auth-subtitle {
  color: #666;
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
  color: #333;
}

input {
  padding: 0.6rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #333;
}

button {
  margin-top: 0.5rem;
  padding: 0.7rem;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background: #333;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #e53e3e;
  font-size: 0.875rem;
  margin: 0;
}

.auth-switch {
  margin-top: 1.25rem;
  text-align: center;
  font-size: 0.875rem;
  color: #666;
}

.auth-switch a {
  color: #111;
  font-weight: 500;
  text-decoration: none;
}

.auth-switch a:hover {
  text-decoration: underline;
}
</style>
