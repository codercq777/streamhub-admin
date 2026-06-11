import { defineStore } from 'pinia'
import { ref } from 'vue'
import { applyTheme, getStoredTheme, themes } from '@/utils/theme'

export const useAppStore = defineStore('app', () => {
  // 侧边栏折叠
  const sidebarCollapsed = ref(false)
  // 暗色模式
  const isDark = ref(false)
  // 主题名
  const themeName = ref(getStoredTheme())
  // 顶栏高度
  const headerHeight = 60

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function toggleDark() {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('admin-dark', String(isDark.value))
  }

  function setTheme(name: string) {
    themeName.value = name
    const theme = applyTheme(name)
    // 暗色主题自动开 dark class
    isDark.value = !!theme.isDark
    localStorage.setItem('admin-dark', String(isDark.value))
  }

  function initTheme() {
    // 主题色(可能带 isDark 自动开暗)
    const theme = applyTheme(themeName.value)
    // 用户手动切换的暗色偏好优先
    const savedDark = localStorage.getItem('admin-dark')
    if (savedDark !== null) {
      isDark.value = savedDark === 'true'
    } else {
      isDark.value = !!theme.isDark
    }
    document.documentElement.classList.toggle('dark', isDark.value)
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
