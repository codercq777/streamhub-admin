// 主题色配置(从浅到暗)

export interface Theme {
  name: string
  label: string
  primary: string
  desc: string
  isDark?: boolean
}

export const themes: Theme[] = [
  { name: 'cherry', label: '樱粉', primary: '#ff2442', desc: '热情、活力' },
  { name: 'sky', label: '天蓝', primary: '#3b82f6', desc: '清爽、专业' },
  { name: 'mint', label: '薄荷', primary: '#10b981', desc: '清新、自然' },
  { name: 'amber', label: '琥珀', primary: '#f59e0b', desc: '温暖、阳光' },
  { name: 'purple', label: '紫罗兰', primary: '#8b5cf6', desc: '神秘、创意' },
  { name: 'ocean', label: '深海', primary: '#0ea5e9', desc: '深邃、商务' },
  { name: 'midnight', label: '暗夜紫', primary: '#a855f7', desc: '深邃、个性', isDark: true },
  { name: 'carbon', label: '炭黑', primary: '#06b6d4', desc: '极客、简约', isDark: true },
]

// ===== 颜色工具 =====
function hexToRgb(hex: string) {
  const c = hex.replace('#', '')
  return {
    r: parseInt(c.slice(0, 2), 16),
    g: parseInt(c.slice(2, 4), 16),
    b: parseInt(c.slice(4, 6), 16),
  }
}
function rgbToHex(r: number, g: number, b: number) {
  return (
    '#' +
    [r, g, b]
      .map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0'))
      .join('')
  )
}
function mix(c1: string, c2: string, weight: number) {
  const a = hexToRgb(c1)
  const b = hexToRgb(c2)
  return rgbToHex(
    a.r * (1 - weight) + b.r * weight,
    a.g * (1 - weight) + b.g * weight,
    a.b * (1 - weight) + b.b * weight
  )
}

// Element Plus 衍生色规则:light-N = primary + white (N/10)
function derivatives(primary: string) {
  return {
    primary,
    'light-3': mix(primary, '#ffffff', 0.3),
    'light-5': mix(primary, '#ffffff', 0.5),
    'light-7': mix(primary, '#ffffff', 0.7),
    'light-8': mix(primary, '#ffffff', 0.8),
    'light-9': mix(primary, '#ffffff', 0.9),
    'dark-2': mix(primary, '#000000', 0.2),
  }
}

const STORAGE_KEY = 'admin-theme-name'

export function applyTheme(themeName: string) {
  const theme = themes.find((t) => t.name === themeName) || themes[0]
  const c = derivatives(theme.primary)
  const root = document.documentElement

  // Element Plus 主题色
  // 用 !important 防止 element-plus 内部 :where() 包裹的规则抢优先级
  root.style.setProperty('--el-color-primary', c.primary, 'important')
  root.style.setProperty('--el-color-primary-light-3', c['light-3'], 'important')
  root.style.setProperty('--el-color-primary-light-5', c['light-5'], 'important')
  root.style.setProperty('--el-color-primary-light-7', c['light-7'], 'important')
  root.style.setProperty('--el-color-primary-light-8', c['light-8'], 'important')
  root.style.setProperty('--el-color-primary-light-9', c['light-9'], 'important')
  root.style.setProperty('--el-color-primary-dark-2', c['dark-2'], 'important')

  // 品牌色(SCSS 引用源)
  root.style.setProperty('--brand-color', c.primary)
  root.style.setProperty('--brand-color-light-3', c['light-3'])
  root.style.setProperty('--brand-color-light-5', c['light-5'])
  root.style.setProperty('--brand-color-light-7', c['light-7'])
  root.style.setProperty('--brand-color-light-8', c['light-8'])
  root.style.setProperty('--brand-color-light-9', c['light-9'])
  root.style.setProperty('--brand-soft', c['light-8'])
  root.style.setProperty('--brand-soft-2', c['light-9'])

  // 品牌渐变(品牌 logo / 登录 banner / 菜单激活)
  root.style.setProperty(
    '--brand-gradient',
    `linear-gradient(135deg, ${c.primary} 0%, ${c['light-3']} 100%)`
  )
  root.style.setProperty(
    '--primary-gradient',
    `linear-gradient(135deg, ${c.primary} 0%, ${c['light-3']} 50%, ${c['light-5']} 100%)`
  )

  // 暗色 class 由 store.setTheme / toggleDark 统一管理,applyTheme 不动
  // (避免切浅色主题时残留 dark class)

  localStorage.setItem(STORAGE_KEY, themeName)
  return theme
}

export function getStoredTheme(): string {
  return localStorage.getItem(STORAGE_KEY) || 'cherry'
}
