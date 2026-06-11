import type { UserInfo, NoteItem } from '@/types'

// ===== 头像生成 =====
const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`

const cover = (i: number) =>
  `https://picsum.photos/seed/note${i}/400/300`

// ===== 模拟用户 =====
const nicknames = [
  '夏天的风', '代码诗人', '深夜码农', '前端小仙女', '全栈老六',
  'Pixel 旅人', 'Bug 终结者', '光影捕手', 'City 漫步者', '冷萃咖啡',
  '代码之外', '数字游民', '猫系青年', '胶片猎人', '睡前故事',
  '野生设计师', '硬核玩家', '人间清醒', '海盐汽水', '虚数空间',
]

export const mockUsers: UserInfo[] = Array.from({ length: 42 }, (_, i) => {
  const status: UserInfo['status'] = i % 17 === 0 ? 'banned' : 'active'
  return {
    id: 10000 + i,
    username: `user_${1000 + i}`,
    nickname: nicknames[i % nicknames.length] + (i > 19 ? String(Math.floor(i / 20) + 1) : ''),
    avatar: avatar(`user${i}`),
    role: i === 0 ? 'admin' : i % 5 === 0 ? 'operator' : 'viewer',
    email: `user${i}@streamhub.io`,
    status,
    createdAt: new Date(
      Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)
    ).toISOString(),
    notesCount: Math.floor(Math.random() * 200),
    followersCount: Math.floor(Math.random() * 5000),
  }
})

// ===== 模拟笔记(待审核) =====
const categories = ['生活', '科技', '旅行', '美食', '摄影', '设计', '学习', '音乐', '游戏']
const tagsPool = [
  ['日常', 'vlog'], ['前端', 'Vue', 'TypeScript'], ['旅行', '日本', 'vlog'],
  ['美食', '探店'], ['摄影', '胶片'], ['设计', 'Figma'],
  ['学习', '算法'], ['音乐', '独立'], ['游戏', '独立游戏'],
  ['AI', 'LLM'], ['穿搭', 'OOTD'], ['读书', '随笔'],
]
const titlePool = [
  '凌晨三点的咖啡馆,我学会了一件事',
  '为什么我最终选择了 Vue 3',
  '在京都找到 7 家不踩雷的咖啡店',
  '独立开发一年,我用 AI 写完了所有代码',
  '胶片摄影入门:这三款相机让我重拾摄影',
  '一次失败的产品复盘',
  '我把家里改造成了 100% 无印良品风',
  '周末两天,我去了趟威海',
  '聊聊我最近的远程工作流',
  '不焦虑的人生是什么样的?',
  '北京胡同里的 5 家小酒馆',
  '我把 Mac 桌面整理成了这样',
  '关于独立开发者的几个真相',
  '在阳台上种了一个月香草',
  '为什么我不再用 Notion 了',
]

export const mockNotes: NoteItem[] = Array.from({ length: 36 }, (_, i) => {
  const status: NoteItem['status'] =
    i < 18 ? 'pending' : i < 28 ? 'approved' : 'rejected'
  const tags = tagsPool[i % tagsPool.length]
  return {
    id: 1000 + i,
    title: titlePool[i % titlePool.length],
    content:
      '这是一段示例正文,演示笔记内容审核场景。实际内容由用户提交,可能包含图片、文字、话题标签。管理员可以批准通过或拒绝该内容,拒绝时需要填写拒绝原因。',
    cover: cover(i),
    authorId: 10000 + (i % 30),
    authorName: nicknames[i % nicknames.length],
    authorAvatar: avatar(`author${i}`),
    category: categories[i % categories.length],
    tags,
    status,
    rejectReason: status === 'rejected' ? '内容含有违禁词' : undefined,
    likes: Math.floor(Math.random() * 8000),
    comments: Math.floor(Math.random() * 500),
    createdAt: new Date(
      Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
    ).toISOString(),
  }
})

// ===== 指标卡(顶部数据) =====
export const mockMetrics = [
  {
    label: '今日活跃用户',
    value: 12849,
    suffix: '',
    trend: 12.4,
    trendUp: true,
    icon: 'User',
    color: 'primary',
  },
  {
    label: '新增内容',
    value: 327,
    suffix: '篇',
    trend: 8.2,
    trendUp: true,
    icon: 'Document',
    color: 'success',
  },
  {
    label: '待审核',
    value: 18,
    suffix: '条',
    trend: 4.1,
    trendUp: false,
    icon: 'CircleCheck',
    color: 'warning',
  },
  {
    label: '本月营收',
    value: '¥ 38,520',
    suffix: '',
    trend: 23.6,
    trendUp: true,
    icon: 'Wallet',
    color: 'purple',
  },
]

// ===== 折线图:近 30 天用户增长 =====
export const mockGrowthData = Array.from({ length: 30 }, (_, i) => ({
  date: `${i + 1}日`,
  uv: 200 + Math.floor(Math.random() * 800) + i * 8,
  pv: 800 + Math.floor(Math.random() * 2000) + i * 25,
}))

// ===== 柱状图:近 7 天发布 =====
export const mockPublishData = Array.from({ length: 7 }, (_, i) => ({
  day: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],
  count: 200 + Math.floor(Math.random() * 300),
}))

// ===== 饼图:内容分类占比 =====
export const mockCategoryData = [
  { name: '生活', value: 412 },
  { name: '科技', value: 318 },
  { name: '旅行', value: 256 },
  { name: '美食', value: 198 },
  { name: '摄影', value: 167 },
  { name: '设计', value: 124 },
  { name: '其他', value: 89 },
]

// ===== 漏斗:用户留存 =====
export const mockFunnelData = [
  { name: '注册', value: 10000 },
  { name: '完善资料', value: 7800 },
  { name: '首次发布', value: 4200 },
  { name: '7 日留存', value: 2100 },
  { name: '30 日留存', value: 980 },
]

// ===== 24h 活跃热力 =====
export const mockHeatmap = Array.from({ length: 7 }, (_, d) => ({
  day: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][d],
  hours: Array.from({ length: 24 }, (_, h) => {
    let base = 30
    if (h >= 8 && h <= 11) base = 70
    if (h >= 12 && h <= 14) base = 85
    if (h >= 19 && h <= 23) base = 90
    if (h >= 0 && h <= 6) base = 15
    if (d >= 5) base += 15 // 周末 +15
    return Math.max(0, Math.min(100, base + Math.floor(Math.random() * 25) - 12))
  }),
}))
