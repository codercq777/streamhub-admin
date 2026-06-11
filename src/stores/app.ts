import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 侧边栏折叠
  const sidebarCollapsed = ref(false)
  // 暗色模式
  const isDark = ref(false)
  // 顶栏高度
  const headerHeight = 60

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function toggleDark() {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  function initTheme() {
    const saved = localStorage.getItem('app-theme')
    if (saved === 'dark') {
      isDark.value = true
      document.documentElement.classList.add('dark')
    }
  }

  return {
    sidebarCollapsed,
    isDark,
    headerHeight,
    toggleSidebar,
    toggleDark,
    initTheme,
  }
})
