import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePreferencesStore } from '@/stores/preferences'

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
  }
}

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('@/views/LandingView.vue'),
    meta: { public: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/app',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
  },
  {
    path: '/app/transactions',
    name: 'Transactions',
    component: () => import('@/views/TransactionsView.vue'),
  },
  {
    path: '/app/analysis',
    name: 'Analysis',
    component: () => import('@/views/AnalysisView.vue'),
  },
  {
    path: '/app/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

let prefsLoaded = false

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!to.meta.public && !auth.isAuthenticated) {
    prefsLoaded = false
    return { name: 'Login' }
  }
  if (to.meta.public && to.name !== 'Landing' && auth.isAuthenticated) {
    return { name: 'Dashboard' }
  }
  if (auth.isAuthenticated && !prefsLoaded) {
    prefsLoaded = true
    usePreferencesStore().fetch()
  }
})

export default router
