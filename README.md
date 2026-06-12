# StreamHub Admin

> 配套 [streamhub-uniapp](https://github.com/codercq777/streamhub-uniapp) 小程序的 PC 内容审核 / 用户管理 / 数据分析后台。

![Vue 3.5](https://img.shields.io/badge/Vue-3.5-42b883)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)
![Vite 8](https://img.shields.io/badge/Vite-8-646cff)
![Element Plus](https://img.shields.io/badge/Element%20Plus-2.14-409eff)
![ECharts 6](https://img.shields.io/badge/ECharts-6-aa344d)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ 项目亮点

- **🎨 8 主题色 + 暗色模式** — 全 CSS 变量驱动,SCSS 编译时引用 `var()`,主题切换运行时响应,无需 reload
- **🔐 RBAC 三角色权限** — 路由守卫 + `meta.roles` + 自定义 `v-permission` 指令
- **📋 操作审计日志** — 关键操作自动入库,时间线展示 + 多维筛选
- **📺 数据大屏** — 1920×1080 设计稿 + CSS `zoom` 响应式缩放 + Fullscreen API
- **📊 6 种 ECharts** — 折线 / 柱状 / 饼图 / 雷达 / 漏斗 / 热力图
- **🏗️ TypeScript strict** — 14 个 vitest 测试覆盖关键状态同步与组件注册
- **🎯 Element Plus 全量图标** — `import * as ElIcons` + 循环 `app.component` 注册

## 🚀 快速体验

```bash
npm install
npm run dev          # http://localhost:8083
npm run build        # 类型检查 + 产物构建
npm test             # 14 个 vitest 测试
```

### 体验账号(三个角色,RBAC 即开即用)

| 账号 | 密码 | 角色 | 能做什么 |
| --- | --- | --- | --- |
| `admin` | `admin123` | 超级管理员 | 全部模块 + 全部操作 |
| `operator` | `op123` | 内容运营 | 审核 + 日志,不能建用户 / 封禁 |
| `viewer` | `view123` | 只读账号 | 只看看板 / 审核 / 用户,不能操作 |

## 📦 功能模块

| 模块 | 路径 | 关键能力 |
| --- | --- | --- |
| 数据看板 | `/dashboard` | 4 指标卡 / 折线 / 柱状 / 待审核 / 系统健康度 |
| 内容审核 | `/audit` | 状态 tab / 列表分页 / 详情抽屉 / 拒绝弹窗 / 批量通过 / v-permission |
| 用户管理 | `/users` | 4 统计 / 搜索筛选 / 表格分页 / 封禁解封 / 详情抽屉 / 新建用户弹窗 |
| 数据分析 | `/analytics` | 分类饼图 / 转化漏斗 / 24h 活跃热力 / 流量来源 / 留存柱状 |
| **数据大屏** | `/bigscreen` | 6+ 图表 / 数字翻牌器 / 实时滚动 / CSS zoom 响应式 / 全屏 API |
| 操作日志 | `/logs` | 4 统计 / 类型筛选 / 操作人搜索 / 状态筛选 / 时间线展示 |
| 主题切换 | 顶栏下拉 | 8 主题色块 + 暗色模式开关 |
| 个人中心 | 顶栏下拉 | 抽屉显示账号 / Token / IP / 操作统计 |
| 系统设置 | 顶栏下拉 | 抽屉配置站点信息 + 功能开关 |

## 🎬 演示路径(3 分钟讲完)

> 建议按这个顺序演示,体现完整业务流

1. **登录** — 演示 3 个账号切换,看菜单变化
2. **Dashboard** — 看 4 指标 + 折线 + 柱状
3. **内容审核** — 批量选中 → 批量通过(展示 v-permission)
4. **用户管理** — 新建用户 → 封禁 → 看日志记录
5. **主题切换** — 8 色块横切,切暗色
6. **数据大屏** — 翻牌器动画 → 6 图表 → 点全屏
7. **操作日志** — 看刚才所有操作的时间线

## 🏗️ 技术栈

| 类别 | 选型 | 理由 |
| --- | --- | --- |
| 框架 | Vue 3.5 + `<script setup>` | 编译时优化 + 组合式 API |
| 语言 | TypeScript (strict) | 全类型化,14 个 vitest 兜底 |
| 构建 | Vite 8 | 启动 < 200ms,HMR 极速 |
| UI | Element Plus 2.14 | 国内后台主流,组件全 |
| 状态 | Pinia 3 | setup 风格,store 解耦 |
| 路由 | Vue Router 4 | meta.roles + 守卫 |
| 图表 | ECharts 6 + vue-echarts | 6 种 chart 按需注册 |
| 样式 | SCSS + CSS 变量 | 主题切换零成本 |
| 测试 | vitest + happy-dom | 状态同步 / 组件注册回归 |

## 📁 目录结构

```
src/
├── api/                # mock 数据(无后端依赖)
├── directives/         # 自定义指令(v-permission)
├── layouts/            # AdminLayout(侧边栏 + 顶栏 + 主内容)
├── router/             # 路由 + 守卫 + getAccessibleRoutes 菜单
├── stores/             # app(主题) / user(RBAC) / log(审计)
├── styles/             # var.scss(SCSS 变量) + index.scss(全局 + 暗色)
├── types/              # TS 类型 + auto-imports.d.ts
├── utils/              # theme / permission / format / request / echarts
└── views/              # login / dashboard / audit / users / analytics / bigscreen / logs / 404
```

## 🧪 测试

```bash
npm test            # 14 个 case
npm run test:watch  # 监听
```

覆盖:
- 主题切换 8 主题 × 暗色模式各种组合(11 case)
- ECharts 6 种图表注册完整性(3 case)

## 📜 设计要点

### 主题切换
- `:root` 暴露 `--brand-color` `--bg-card` `--text-primary` 等 CSS 变量
- `applyTheme` 用 `setProperty(..., 'important')` 写入,inline style 跑赢 EP 内部 `:where()`
- 单一 `syncDarkClass()` 入口管理 `html.dark` class,避免 watch 副作用不可控
- 14 个 vitest 状态同步回归测试

### 权限系统
- 三层结构:**路由 meta.roles** + **工具函数 hasPermission** + **自定义 v-permission 指令**
- 路由守卫 `beforeEach` 拦截越权
- 侧边栏菜单 `getAccessibleRoutes(roles)` 动态过滤
- 按钮级 `<el-button v-permission="'user:ban'">`

### 数据大屏
- 设计稿 1920×1080,响应式用 `ResizeObserver` 监听 wrapper 实际尺寸
- `CSS zoom` 而非 `transform: scale` 同步缩放 box,避免溢出被裁
- `wrapper.requestFullscreen()` 浏览器全屏 API,DOM 隔离

## 📄 License

MIT
