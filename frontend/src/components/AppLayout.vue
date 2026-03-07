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

      <button class="logout-btn" @click="handleLogout">Sign out</button>
    </nav>

    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

function handleLogout() {
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
  background: #111;
  color: #fff;
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
  color: #aaa;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: background 0.15s, color 0.15s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  background: #222;
  color: #fff;
}

.logout-btn {
  background: none;
  border: 1px solid #333;
  color: #aaa;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, color 0.15s;
}

.logout-btn:hover {
  background: #222;
  color: #fff;
}

.main-content {
  flex: 1;
  padding: 2rem;
  background: #f9f9f9;
  overflow-y: auto;
}
</style>
