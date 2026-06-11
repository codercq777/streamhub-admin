// 全局类型定义

export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  role: 'admin' | 'operator' | 'viewer'
  email: string
  status: 'active' | 'banned'
  createdAt: string
  notesCount: number
  followersCount: number
}

export interface NoteItem {
  id: number
  title: string
  content: string
  cover: string
  authorId: number
  authorName: string
  authorAvatar: string
  category: string
  tags: string[]
  status: 'pending' | 'approved' | 'rejected'
  rejectReason?: string
  likes: number
  comments: number
  createdAt: string
}

export interface MetricCard {
  label: string
  value: number | string
  suffix?: string
  trend: number // 百分比
  trendUp: boolean
  icon: string
  color: string
}

export interface LoginForm {
  username: string
  password: string
  remember: boolean
}
