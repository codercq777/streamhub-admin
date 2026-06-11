import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Role = 'admin' | 'operator' | 'viewer'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('admin-token') || '')
  const username = ref<string>(localStorage.getItem('admin-username') || '')
  const avatar = ref<string>(
    localStorage.getItem('admin-avatar') || 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
  )
  const roles = ref<Role[]>(
    (JSON.parse(localStorage.getItem('admin-roles') || '["admin"]') as Role[])
  )

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => roles.value.includes('admin'))
  const primaryRole = computed<Role>(() => roles.value[0] || 'viewer')

  // 模拟账号库(作品集用,真实场景走接口)
  const mockAccounts: Record<string, { password: string; roles: Role[]; nickname: string }> = {
    admin: { password: 'admin123', roles: ['admin'], nickname: '超级管理员' },
    operator: { password: 'op123', roles: ['operator'], nickname: '内容运营' },
    viewer: { password: 'view123', roles: ['viewer'], nickname: '只读账号' },
  }

  function login(payload: { username: string; password: string; remember: boolean }) {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const acc = mockAccounts[payload.username]
        if (!acc || acc.password !== payload.password) {
          reject(new Error('账号或密码错误'))
          return
        }
        token.value = `mock-token-${Date.now()}`
        username.value = payload.username
        roles.value = acc.roles
        if (payload.remember) {
          localStorage.setItem('admin-token', token.value)
          localStorage.setItem('admin-username', payload.username)
          localStorage.setItem('admin-roles', JSON.stringify(acc.roles))
        }
        resolve()
      }, 600)
    })
  }

  function logout() {
    token.value = ''
    username.value = ''
    roles.value = []
    localStorage.removeItem('admin-token')
    localStorage.removeItem('admin-username')
    localStorage.removeItem('admin-roles')
  }

  // 角色文案映射
  const roleLabel: Record<Role, string> = {
    admin: '超级管理员',
    operator: '内容运营',
    viewer: '只读账号',
  }

  return {
    token,
    username,
    avatar,
    roles,
    isLoggedIn,
    isAdmin,
    primaryRole,
    roleLabel,
    login,
    logout,
  }
})
