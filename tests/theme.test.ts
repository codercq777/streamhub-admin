// 主题/dark 状态同步 e2e 自检(vitest + happy-dom)
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from '@/stores/app'
import { themes } from '@/utils/theme'

describe('主题 + 暗色模式状态同步', () => {
  let store: ReturnType<typeof useAppStore>

  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    setActivePinia(createPinia())
    store = useAppStore()
    store.initTheme()
  })

  const isDarkClass = () => document.documentElement.classList.contains('dark')

  it('[1] 初始:isDark=false,无 dark class', () => {
    expect(store.isDark).toBe(false)
    expect(isDarkClass()).toBe(false)
  })

  it('[2] toggleDark 后:isDark=true,加 dark class', () => {
    store.toggleDark()
    expect(store.isDark).toBe(true)
    expect(isDarkClass()).toBe(true)
  })

  it('[3] 暗色下切到「天蓝」(浅色),保持暗色', () => {
    store.toggleDark()
    store.setTheme('sky')
    expect(store.isDark).toBe(true)
    expect(isDarkClass()).toBe(true)
    expect(store.themeName).toBe('sky')
  })

  it('[4] 暗色下切到「薄荷」(浅色),保持暗色', () => {
    store.toggleDark()
    store.setTheme('mint')
    expect(store.isDark).toBe(true)
    expect(isDarkClass()).toBe(true)
  })

  it('[5] 暗色下 toggleDark 关掉,切「天蓝」保持浅色', () => {
    store.toggleDark()
    store.toggleDark()
    expect(store.isDark).toBe(false)
    expect(isDarkClass()).toBe(false)
    store.setTheme('sky')
    expect(store.isDark).toBe(false)
    expect(isDarkClass()).toBe(false)
  })

  it('[6] 切「暗夜紫」,isDark 不自动开(用户偏好独立)', () => {
    store.setTheme('midnight')
    expect(store.isDark).toBe(false)
    expect(isDarkClass()).toBe(false)
    expect(store.themeName).toBe('midnight')
  })

  it('[7] 「暗夜紫」下手动开暗,切「天蓝」保持暗色', () => {
    store.setTheme('midnight')
    store.toggleDark()
    expect(store.isDark).toBe(true)
    expect(isDarkClass()).toBe(true)
    store.setTheme('sky')
    expect(store.isDark).toBe(true)
    expect(isDarkClass()).toBe(true)
  })

  it('[8] 全部 8 主题切一遍,不抛错,isDark 不被主题改', () => {
    for (const t of themes) {
      store.setTheme(t.name)
      expect(store.themeName).toBe(t.name)
    }
    expect(store.isDark).toBe(false) // 全程没动 toggleDark
  })

  it('[9] 持久化:toggleDark 写 localStorage,setTheme 写主题名', () => {
    store.toggleDark()
    expect(localStorage.getItem('admin-dark')).toBe('true')
    store.setTheme('amber')
    expect(localStorage.getItem('admin-theme-name')).toBe('amber')
  })

  it('[10] 关键回归:开暗 → 切浅色主题 → class 仍在', () => {
    store.toggleDark()
    expect(isDarkClass()).toBe(true)
    for (const t of ['sky', 'mint', 'amber', 'purple', 'ocean', 'cherry']) {
      store.setTheme(t)
      expect(isDarkClass()).toBe(true) // 关键:不丢失
    }
  })

  it('[11] 关键回归:关暗 → 切任意主题 → class 不残留', () => {
    store.toggleDark()
    store.toggleDark() // 关
    expect(isDarkClass()).toBe(false)
    for (const t of themes) {
      store.setTheme(t.name)
      expect(isDarkClass()).toBe(false) // 关键:不残留
    }
  })
})
