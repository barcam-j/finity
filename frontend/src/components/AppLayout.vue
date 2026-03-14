<template>
  <div class="app-layout">
    <nav class="sidebar">
      <div class="sidebar-header">
        <span class="logo">finity</span>
      </div>

      <ul class="nav-links">
        <li>
          <RouterLink :to="{ name: 'Dashboard' }">Dashboard</RouterLink>
        </li>
        <li>
          <RouterLink :to="{ name: 'Transactions' }">Transactions</RouterLink>
        </li>
        <li>
          <RouterLink :to="{ name: 'Analysis' }">Analysis</RouterLink>
        </li>
        <li>
          <RouterLink :to="{ name: 'Settings' }">Settings</RouterLink>
        </li>
      </ul>

      <div class="sidebar-footer">
        <button class="theme-btn" @click="themeStore.cycle()" :title="themeLabel">
          {{ themeLabel }}
        </button>
        <button class="logout-btn" @click="handleLogout">Sign out</button>
      </div>
    </nav>

    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const auth = useAuthStore()
const themeStore = useThemeStore()

const themeLabel = computed(() => {
  if (themeStore.theme === 'light') return 'Light'
  if (themeStore.theme === 'dark') return 'Dark'
  return 'System'
})

function handleLogout(): void {
  auth.logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  background: var(--sidebar-bg);
  color: var(--sidebar-text-active);
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  flex-shrink: 0;
}

.sidebar-header {
  margin-bottom: 2rem;
}

.logo {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--sidebar-text-active);
}

.nav-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.nav-links a {
  display: block;
  padding: 0.6rem 0.75rem;
  color: var(--sidebar-text);
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.95rem;
  transition:
    background 0.15s,
    color 0.15s;
}

.nav-links a:hover {
  background: var(--sidebar-hover);
  color: var(--sidebar-text-active);
}

.nav-links a.router-link-active {
  background: var(--accent);
  color: #ffffff;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.theme-btn,
.logout-btn {
  background: none;
  border: 1px solid var(--sidebar-border);
  color: var(--sidebar-text);
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition:
    background 0.15s,
    color 0.15s;
}

.theme-btn:hover,
.logout-btn:hover {
  background: var(--sidebar-hover);
  color: var(--sidebar-text-active);
}

.main-content {
  flex: 1;
  padding: 2rem;
  background: var(--bg-secondary);
  overflow-y: auto;
}
</style>
