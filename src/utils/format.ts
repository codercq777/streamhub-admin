// 日期格式化
export function formatDate(d: string | Date, withTime = true): string {
  const date = typeof d === 'string' ? new Date(d) : d
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  if (!withTime) return `${y}-${m}-${day}`
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

// 相对时间
export function relativeTime(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
  if (diff < 604800) return `${Math.floor(diff / 86400)} 天前`
  return formatDate(date, false)
}

// 数字简化 (1234 -> 1.2k)
export function compact(n: number): string {
  if (n < 1000) return String(n)
  if (n < 10000) return (n / 1000).toFixed(1) + 'k'
  if (n < 1_000_000) return (n / 10000).toFixed(1) + 'w'
  return (n / 1_000_000).toFixed(1) + 'm'
}
