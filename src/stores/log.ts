import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LogEntry, LogType } from '@/types'
import { mockLogs } from '@/api/logs'
import { useUserStore } from './user'

let nextId = 100000

export const useLogStore = defineStore('log', () => {
  // 初始 mock + 内存中新增的(临时存)
  const logs = ref<LogEntry[]>([...mockLogs])

  function addLog(payload: { type: LogType; action: string; target: string; status?: 'success' | 'failed' }) {
    const userStore = useUserStore()
    const entry: LogEntry = {
      id: nextId++,
      type: payload.type,
      action: payload.action,
      target: payload.target,
      operator: userStore.username || 'unknown',
      operatorRole: userStore.roleLabel[userStore.primaryRole] || '未知',
      ip: '192.168.1.10',
      status: payload.status || 'success',
      timestamp: new Date().toISOString(),
    }
    // 插到最前
    logs.value.unshift(entry)
    // 限制最多 200 条,避免内存无限增长
    if (logs.value.length > 200) {
      logs.value = logs.value.slice(0, 200)
    }
    return entry
  }

  return { logs, addLog }
})
