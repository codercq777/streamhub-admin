import type { Role } from '@/stores/user'

// 权限码定义(用于按钮级别 v-permission)
export const PermissionCode = {
  // 内容审核
  AUDIT_VIEW: 'audit:view',
  AUDIT_APPROVE: 'audit:approve',
  AUDIT_REJECT: 'audit:reject',
  AUDIT_BATCH: 'audit:batch',
  // 用户管理
  USER_VIEW: 'user:view',
  USER_BAN: 'user:ban',
  USER_CREATE: 'user:create',
  // 系统
  LOG_VIEW: 'log:view',
  SETTINGS_EDIT: 'settings:edit',
  BIGSCREEN_VIEW: 'bigscreen:view',
} as const

export type PermCode = (typeof PermissionCode)[keyof typeof PermissionCode]

// 角色 -> 权限码 映射
const rolePermissions: Record<Role, PermCode[]> = {
  admin: Object.values(PermissionCode),
  operator: [
    PermissionCode.AUDIT_VIEW,
    PermissionCode.AUDIT_APPROVE,
    PermissionCode.AUDIT_REJECT,
    PermissionCode.AUDIT_BATCH,
    PermissionCode.USER_VIEW,
    PermissionCode.LOG_VIEW,
    PermissionCode.BIGSCREEN_VIEW,
  ],
  viewer: [
    PermissionCode.AUDIT_VIEW,
    PermissionCode.USER_VIEW,
    PermissionCode.BIGSCREEN_VIEW,
  ],
}

export function hasPermission(roles: Role[], codes: PermCode | PermCode[]): boolean {
  if (!roles || roles.length === 0) return false
  const required = Array.isArray(codes) ? codes : [codes]
  // 任一角色具备任一权限即通过
  return roles.some((r) => rolePermissions[r]?.some((c) => required.includes(c)))
}

export function hasRole(roles: Role[], required: Role | Role[]): boolean {
  if (!roles || roles.length === 0) return false
  const list = Array.isArray(required) ? required : [required]
  return roles.some((r) => list.includes(r))
}
