// 主题/dark 状态同步 e2e 自检
// 用 jsdom 模拟 DOM,跑 8 主题 × toggle 暗色 × 各种组合,断言 isDark / classList 同步

import { JSDOM } from 'jsdom'

// 模拟浏览器环境
const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/',
})
global.document = dom.window.document
global.window = dom.window
global.localStorage = dom.window.localStorage
global.HTMLElement = dom.window.HTMLElement

// 用 ESM 导入源码(经过 vite 构建,这里改用 tsx 直接执行)
const { setActivePinia, createPinia } = await import('pinia')
const { useAppStore } = await import('../src/stores/app.ts')
const { themes } = await import('../src/utils/theme.ts')

setActivePinia(createPinia())
const store = useAppStore()
store.initTheme()

let pass = 0
let fail = 0

function assert(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (ok) {
    pass++
    console.log(`  ✓ ${name}`)
  } else {
    fail++
    console.log(`  ✗ ${name}`)
    console.log(`     actual:   ${JSON.stringify(actual)}`)
    console.log(`     expected: ${JSON.stringify(expected)}`)
  }
}

function isDarkClass() {
  return document.documentElement.classList.contains('dark')
}

function reset() {
  localStorage.clear()
  store.isDark = false
  document.documentElement.classList.remove('dark')
  store.themeName = 'cherry'
  store.initTheme()
}

console.log('=== 主题/dark 状态同步 e2e 自检 ===\n')

// 1. 初始状态
console.log('[1] 初始状态')
reset()
assert('isDark = false', store.isDark, false)
assert('html.classList 没 dark', isDarkClass(), false)

// 2. 手动 toggle 暗色
console.log('\n[2] 手动 toggleDark()')
store.toggleDark()
assert('isDark = true', store.isDark, true)
assert('html.classList 有 dark', isDarkClass(), true)

// 3. 切到浅色主题后,保持暗色(用户偏好优先)
console.log('\n[3] 切到「天蓝」(浅色),保持暗色')
store.setTheme('sky')
assert('isDark 仍是 true', store.isDark, true)
assert('html.classList 仍有 dark', isDarkClass(), true)
assert('themeName 切到 sky', store.themeName, 'sky')

// 4. 切到「薄荷」(浅色),保持暗色
console.log('\n[4] 切到「薄荷」(浅色),保持暗色')
store.setTheme('mint')
assert('isDark 仍是 true', store.isDark, true)
assert('html.classList 仍有 dark', isDarkClass(), true)

// 5. toggleDark 关掉
console.log('\n[5] toggleDark() 关掉')
store.toggleDark()
assert('isDark = false', store.isDark, false)
assert('html.classList 没 dark', isDarkClass(), false)

// 6. 切到「暗夜紫」(自带 isDark),不动 isDark
console.log('\n[6] 切到「暗夜紫」(自带 isDark)')
store.setTheme('midnight')
assert('isDark 还是 false(用户偏好独立)', store.isDark, false)
assert('html.classList 没 dark', isDarkClass(), false)
assert('themeName 切到 midnight', store.themeName, 'midnight')

// 7. 然后手动开暗色
console.log('\n[7] 在「暗夜紫」下手动开暗')
store.toggleDark()
assert('isDark = true', store.isDark, true)
assert('html.classList 有 dark', isDarkClass(), true)

// 8. 切到「天蓝」,保持暗色
console.log('\n[8] 暗色状态下切到「天蓝」')
store.setTheme('sky')
assert('isDark 仍是 true', store.isDark, true)
assert('html.classList 仍有 dark', isDarkClass(), true)
assert('themeName 切到 sky', store.themeName, 'sky')

// 9. 切到「樱粉」(浅色),保持暗色
console.log('\n[9] 切到「樱粉」,保持暗色')
store.setTheme('cherry')
assert('isDark 仍是 true', store.isDark, true)
assert('html.classList 仍有 dark', isDarkClass(), true)

// 10. 关键回归测试:浅色下开暗 → 切浅色主题 → switch 视觉跟 class 同步
console.log('\n[10] 回归:开暗 → 切浅色 → 关暗 → 切浅色,验证 classList 同步')
store.toggleDark() // 关
assert('isDark = false', store.isDark, false)
assert('html.classList 没 dark', isDarkClass(), false)
store.setTheme('ocean')
assert('切「深海」后 classList 没 dark', isDarkClass(), false)

// 11. 全部 8 主题切一遍,不抛错
console.log('\n[11] 全部 8 主题切一遍')
for (const t of themes) {
  store.setTheme(t.name)
  assert(`切到 ${t.name} 不抛错`, store.themeName, t.name)
}

// 12. 持久化
console.log('\n[12] 持久化测试')
store.toggleDark() // 开
const lsAfterToggle = localStorage.getItem('admin-dark')
assert('localStorage admin-dark = true', lsAfterToggle, 'true')
store.setTheme('amber')
const lsTheme = localStorage.getItem('admin-theme-name')
assert('localStorage admin-theme-name = amber', lsTheme, 'amber')

console.log(`\n=== 结果: ${pass} pass, ${fail} fail ===`)
if (fail > 0) process.exit(1)
