import { defineStore } from 'pinia'
import { ref } from 'vue'
import { applyTheme, getStoredTheme, themes } from '@/utils/theme'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  // 暗色模式(独立于主题色,可与任意主题自由组合)
  const isDark = ref(false)
  // 主题名
  const themeName = ref(getStoredTheme())
  // 顶栏高度
  const headerHeight = 60

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  // 同步 dark class 到 <html>(单一入口,避免 watch 副作用)
  function syncDarkClass() {
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('admin-dark', String(isDark.value))
  }

  function toggleDark() {
    isDark.value = !isDark.value
    syncDarkClass()
  }

  function setTheme(name: string) {
    themeName.value = name
    applyTheme(name)
    // isDark 不动(用户手动暗色偏好继续生效)
  }

  function initTheme() {
    // 1) 应用主题色(不动 dark class)
    applyTheme(themeName.value)
    // 2) 恢复用户暗色偏好 + 同步 class
    const savedDark = localStorage.getItem('admin-dark')
    isDark.value = savedDark === 'true'
    syncDarkClass()
  }

  return {
    sidebarCollapsed,
    isDark,
    themeName,
    themes,
    headerHeight,
    toggleSidebar,
    toggleDark,
    setTheme,
    initTheme,
  }
})
