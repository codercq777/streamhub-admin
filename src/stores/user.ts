import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('admin-token') || '')
  const username = ref<string>(localStorage.getItem('admin-username') || '')
  const avatar = ref<string>(
    localStorage.getItem('admin-avatar') || 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
  )

  const isLoggedIn = computed(() => !!token.value)

  function login(payload: { username: string; password: string; remember: boolean }) {
    // 模拟登录,真实场景调接口
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        token.value = `mock-token-${Date.now()}`
        username.value = payload.username
        if (payload.remember) {
          localStorage.setItem('admin-token', token.value)
          localStorage.setItem('admin-username', payload.username)
        }
        resolve()
      }, 600)
    })
  }

  function logout() {
    token.value = ''
    username.value = ''
    localStorage.removeItem('admin-token')
    localStorage.removeItem('admin-username')
  }

  return { token, username, avatar, isLoggedIn, login, logout }
})
