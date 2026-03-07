import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const THEMES = ['light', 'dark', 'system']

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme
  document.documentElement.setAttribute('data-theme', resolved)
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(localStorage.getItem('theme') || 'system')

  applyTheme(theme.value)

  watch(theme, (value) => {
    localStorage.setItem('theme', value)
    applyTheme(value)
  })

  function cycle() {
    const current = THEMES.indexOf(theme.value)
    theme.value = THEMES[(current + 1) % THEMES.length]
  }

  return { theme, cycle }
})
