import type { LogEntry } from '@/types'

const actions = [
  { action: '审核通过', target: '笔记 #1024《夏日咖啡》', type: 'audit_approve' },
  { action: '审核拒绝', target: '笔记 #1025《广告推文》', type: 'audit_reject' },
  { action: '批量审核', target: '12 条笔记', type: 'audit_batch' },
  { action: '封禁用户', target: 'user_1042 @小仙女', type: 'user_ban' },
  { action: '解封用户', target: 'user_1019 @设计师', type: 'user_unban' },
  { action: '新建用户', target: 'user_1089 @新同学', type: 'user_create' },
  { action: '导出数据', target: '用户列表 6 月', type: 'data_export' },
  { action: '登录', target: 'Admin Console', type: 'auth_login' },
  { action: '退出登录', target: 'Admin Console', type: 'auth_logout' },
  { action: '修改设置', target: '邮件模板 #3', type: 'settings_edit' },
] as const

const users = ['admin', 'operator', 'admin', 'admin', 'operator', 'admin', 'viewer', 'admin']
const ips = ['192.168.1.10', '10.0.0.23', '172.16.5.88', '192.168.1.10', '10.0.0.23', '192.168.1.10', '172.16.5.88', '192.168.1.10']

export const mockLogs: LogEntry[] = Array.from({ length: 56 }, (_, i) => {
  const a = actions[i % actions.length]
  const now = Date.now() - i * 1000 * 60 * (3 + Math.random() * 47) // 每条间隔 3-50 分钟
  return {
    id: 50000 + i,
    type: a.type,
    action: a.action,
    target: a.target,
    operator: users[i % users.length],
    operatorRole: users[i % users.length] === 'admin' ? '超级管理员' : users[i % users.length] === 'operator' ? '内容运营' : '只读账号',
    ip: ips[i % ips.length],
    status: i % 17 === 0 ? 'failed' : 'success',
    timestamp: new Date(now).toISOString(),
  }
})
