import type { App, Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'
import { hasPermission, type PermCode } from '@/utils/permission'

/**
 * v-permission="'audit:approve'"     单个权限
 * v-permission="['audit:approve', 'audit:reject']"  任一权限通过即可
 */
function check(el: HTMLElement, binding: DirectiveBinding<PermCode | PermCode[]>) {
  const userStore = useUserStore()
  const allowed = hasPermission(userStore.roles, binding.value)
  if (!allowed) {
    el.parentNode?.removeChild(el)
  }
}

const permission: Directive<HTMLElement, PermCode | PermCode[]> = {
  mounted(el, binding) {
    check(el, binding)
  },
  updated(el, binding) {
    // 角色变更时(切换账号)重新检查
    check(el, binding)
  },
}

export function setupPermissionDirective(app: App) {
  app.directive('permission', permission)
}
