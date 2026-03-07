import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  async function login(email, password) {
    loading.value = true
    error.value = null
    try {
      const data = await authService.login(email, password)
      setToken(data.access_token)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function register(email, password) {
    loading.value = true
    error.value = null
    try {
      const data = await authService.register(email, password)
      setToken(data.access_token)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  return { token, user, loading, error, isAuthenticated, login, register, logout }
})
