# StreamHub Admin · 项目规范

> 给 AI 编码助手（Claude Code 等）阅读的项目级上下文。
> 任何 AI 在这个仓库里改代码前**必须**先读完本文。
> 真人开发者也建议阅读。

---

## 1. 项目一句话

**PC 端后台**：配套 StreamHub Mini 小程序的内容审核、用户管理、数据分析、大屏展示后台。
无后端依赖，**全部走 mock 数据**（`src/api/mock.ts`），开箱即跑。

## 2. 技术栈

| 类别 | 选型 | 备注 |
|---|---|---|
| 框架 | Vue 3.5 | **必须** `<script setup>` |
| 语言 | TypeScript 6.0 | `strict: true`，全量类型化 |
| 构建 | Vite 8 | 启动 < 200ms，HMR 极速 |
| UI 库 | Element Plus 2.14 | unplugin 自动按需引入 |
| 图标 | @element-plus/icons-vue | 全量注册到全局 |
| 状态 | Pinia 3 | **Setup Store 风格** |
| 路由 | Vue Router 4 | `meta.roles` + 守卫 |
| 图表 | ECharts 6 + vue-echarts | 6 种 chart 按需注册 |
| HTTP | axios | 实际项目里都走 mock 拦截 |
| 样式 | SCSS + CSS 变量 | 主题切换零成本 |
| 测试 | vitest + happy-dom | 14 个 case |
| 自动导入 | unplugin-auto-import / unplugin-vue-components | Element Plus 组件 + Vue API 免 import |

**Node 版本要求**：>= 20（Vite 8 需要）。

## 3. 目录结构

```
streamhub-admin/
├── src/
│   ├── api/                # mock 数据 + 业务接口封装
│   │   ├── mock.ts         # 36 笔记 / 42 用户 / 多组图表
│   │   └── logs.ts         # 操作日志
│   ├── components/         # 通用组件(各业务域内复用)
│   ├── composables/        # 组合式函数
│   ├── directives/         # 自定义指令
│   │   └── permission.ts   # v-permission 按钮级权限
│   ├── layouts/
│   │   └── AdminLayout.vue # 侧边栏 + 顶栏 + 主内容(所有业务页都套这个)
│   ├── router/
│   │   └── index.ts        # 路由 + 守卫 + getAccessibleRoutes
│   ├── stores/
│   │   ├── app.ts          # 主题 / 侧边栏折叠
│   │   ├── user.ts         # 当前用户 / 角色 / 登录
│   │   └── log.ts          # 操作日志状态
│   ├── styles/
│   │   ├── var.scss        # SCSS 变量(编译时)
│   │   └── index.scss      # 全局 + 暗色模式(运行时)
│   ├── types/
│   │   ├── index.ts        # 业务类型
│   │   └── auto-imports.d.ts
│   ├── utils/
│   │   ├── theme.ts        # applyTheme / syncDarkClass
│   │   ├── permission.ts   # hasPermission 工具函数
│   │   ├── format.ts       # 格式化
│   │   ├── request.ts      # axios + mock 拦截
│   │   └── echarts.ts      # 6 种 chart 注册
│   ├── views/              # 业务页
│   │   ├── login/          # 登录(三角色账号)
│   │   ├── dashboard/      # 数据看板
│   │   ├── audit/          # 内容审核
│   │   ├── users/          # 用户管理
│   │   ├── analytics/      # 数据分析
│   │   ├── bigscreen/      # 数据大屏
│   │   ├── logs/           # 操作日志
│   │   └── 404/
│   ├── assets/             # 静态资源
│   ├── App.vue
│   ├── main.ts             # 入口(挂 Pinia / Router / 指令 / ECharts)
│   └── env.d.ts
├── tests/                  # vitest 测试
├── scripts/                # 构建/部署脚本
├── index.html
├── vite.config.ts          # vite + unplugin + path alias
├── vitest.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
└── package.json
```

## 4. 关键设计

### 4.1 8 主题色 + 暗色模式（核心亮点）

**三层同步**：
1. **SCSS 变量**（`src/styles/var.scss`）—— 编译时引用 `var(--brand-color)`
2. **CSS 变量**（`:root`）—— 运行时切换
3. **Element Plus 衍生色**（`--el-color-primary-light-3/5/7/8/9`）—— `mix()` 函数生成

**修改入口**：`src/utils/theme.ts`
```ts
applyTheme(themeName: string)   // 切主题色
syncDarkClass(isDark: boolean)  // 切暗色
```

**关键实现细节**：
- `setProperty(name, value, 'important')` —— 写 inline style 跑赢 EP 内部 `:where()` 选择器
- **单一入口**管理 `html.dark` class，避免 watch 副作用不可控
- 切主题用 `useTransition` + 200ms 过渡，**不要用 `setTimeout` 硬卡**

**改这块前必读**：`tests/stores/app.test.ts` 11 个 case 覆盖了 8 主题 × 暗色模式各种组合。

### 4.2 RBAC 三角色权限

**三层结构**：
| 层 | 位置 | 作用 |
|---|---|---|
| 路由 | `src/router/index.ts` 的 `meta.roles` | 决定菜单可见性 |
| 工具函数 | `src/utils/permission.ts` 的 `hasPermission(roles, code)` | 程序化判断 |
| 指令 | `src/directives/permission.ts` 的 `v-permission` | 按钮级控制 |

**路由守卫**（`router.beforeEach`）：
- 未登录 → 跳 `/login`
- 已登录但角色不在 `meta.roles` → 跳 `/404`
- 已登录访问 `/login` → 跳 `/dashboard`

**菜单动态过滤**：`getAccessibleRoutes(roles)` 根据当前用户角色过滤路由表，侧边栏自动隐藏无权限模块。

**按钮用法**：
```vue
<el-button v-permission="'user:ban'">封禁</el-button>
<el-button v-permission="'audit:reject'">拒绝</el-button>
```

**修改权限前必读**：`src/types/index.ts` 里的 `PermissionCode` 枚举，所有权限码必须从这里取。

### 4.3 数据大屏（`src/views/bigscreen`）

- 设计稿 **1920×1080**
- 响应式：`ResizeObserver` 监听 wrapper 实际尺寸 → 计算 zoom
- **`CSS zoom` 而非 `transform: scale`** —— 同步缩放 box，避免子元素溢出被裁
- 全屏：`wrapper.requestFullscreen()` 浏览器 API
- 6 种图表：折线 / 柱状 / 饼 / 雷达 / 漏斗 / 省份 + 数字翻牌器 + 实时事件流

**改大屏组件前必读**：`src/utils/echarts.ts` 的 6 种 chart 注册逻辑，大屏用了哪几种就 import 哪几种。

### 4.4 ECharts 按需引入

文件：`src/utils/echarts.ts`

```ts
// 只注册用到的 6 种 + 必要组件
import { LineChart, BarChart, PieChart, RadarChart, FunnelChart, MapChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, ... } from 'echarts/components'

// 暴露 useECharts 给 vue-echarts
```

**新增图表类型必须**：
1. 在 `echarts.ts` import 对应 chart
2. 在 `tests/utils/echarts.test.ts` 加 case 验证注册完整性
3. 用 `vue-echarts` 的 `<v-chart>` 组件

### 4.5 操作审计日志

- 关键操作调 `useLogStore().addLog({ type, target, status })`
- 自动入库到 `logs` Pinia store + 持久化到 localStorage
- `src/views/logs` 时间线展示，支持**操作人 / 类型 / 时间**多维筛选
- 新增审计场景：调用 `addLog` 即可，UI 自动渲染

### 4.6 Mock 数据架构

文件：`src/api/mock.ts` + `src/utils/request.ts`

- 所有 HTTP 请求走 axios，但被**请求拦截器改写**：URL 命中 mock 规则 → 直接返回 mock 数据
- 36 笔记 + 42 用户 + 多组图表数据
- 改 mock 数据结构前**先改 `src/types/index.ts` 的 TS 类型**，再改 mock 实现

## 5. 开发规范

### 5.1 命名
- 文件：组件 PascalCase（`AdminLayout.vue`），工具/函数 camelCase
- 变量：camelCase，常量 UPPER_SNAKE
- 类型：PascalCase，**全用 `type`**，不用 `interface`
- 权限码：`<resource>:<action>` 格式（`user:ban` / `audit:reject`）

### 5.2 组件规范
- **必须**用 `<script setup lang="ts">`
- Props：`defineProps<Props>()`，禁止 Options 写法
- 业务组件**不直接调 API**，走 store

### 5.3 TypeScript 严格
- `tsconfig.app.json` 已开 `strict: true`
- 严禁 `as any` / `// @ts-ignore` 沉默绕过
- 真要绕过必须注释**为什么** + 给出 TODO 修复时间
- `vue-tsc -b` 必须 0 错误才能 build

### 5.4 样式
- **优先**用 `var.scss` 里定义好的 SCSS 变量
- 颜色用 CSS 变量（`var(--brand-color)`），不用硬编码
- 暗色模式：在 `index.scss` 用 `html.dark .selector { ... }` 覆写
- 间距 / 圆角 / 阴影 用 token，不要 magic number

### 5.5 自动导入
- Vue API（`ref` / `computed` / `watch` 等）**不要**手写 import
- Element Plus 组件**不要**手写 import
- 自己写的工具函数必须**显式 import**（自动导入不覆盖）

## 6. 常用命令

```bash
npm install                # 注意可能要 --legacy-peer-deps
npm run dev                # http://localhost:8083
npm run build              # vue-tsc 类型检查 + vite 构建
npm run preview            # 预览生产产物
npm test                   # 14 个 vitest case
npm run test:watch         # 监听模式
```

## 7. 必读子文档

- `README.md` —— 项目总览、演示路径、模块说明
- 本文档 —— 改代码前必读

## 8. AI 协作约定

### 8.1 AI 可以做
- ✅ 新增业务页面（按 §3/§5 规范）
- ✅ 写新组件、加单元测试
- ✅ 修 bug、改样式、加 ECharts 图表
- ✅ 优化性能、加日志

### 8.2 AI **不要**碰
- ❌ `vite.config.ts` 的 `path alias` 配置（`@` → `src`，改了下全崩）
- ❌ `tsconfig.app.json` 的 `paths` / `compilerOptions`（同上）
- ❌ `unplugin-auto-import` / `unplugin-vue-components` 配置（Element Plus 按需引入的根基）
- ❌ `src/utils/echarts.ts` 里的 `use` 注册顺序（依赖图，改了可能漏注册）
- ❌ `src/router/index.ts` 的 `getAccessibleRoutes` 签名（外部调用方依赖）

### 8.3 必须人工把关
- 🔒 权限系统改动（路由 meta.roles / hasPermission / v-permission 三层）
- 🔒 主题系统（动 §4.1 三层同步中任一层都要回归测试）
- 🔒 `tsconfig` 任何字段
- 🔒 `package.json` 版本

### 8.4 提交规范
- **commit message 自己手写**
- 单次 diff > 300 行拆 PR
- `npm run build` 通过 + `npm test` 通过才能提
- 新增主题 / 图表类型 / 权限码 → 同步加测试 case

## 9. 调试常见坑

- **dev 起来报 `Failed to resolve import`** → 检查 `vite.config.ts` 的 alias + `tsconfig` 的 paths 是否一致
- **改主题色不生效** → 看 `applyTheme` 是否被调用 + DOM `:root` inline style 是否被覆盖
- **切暗色模式侧边栏闪** → 检查 `syncDarkClass` 是否**唯一**给 `html.dark` 写 class
- **新增 Element Plus 组件不显示** → 检查 `unplugin-vue-components` 配置 + 重启 dev
- **ECharts 报 `Component xxx is not registered`** → `src/utils/echarts.ts` 没 import 对应 chart / 组件
- **v-permission 失效** → 检查 `permission.ts` 的 `currentRoles` 来源 + `PermissionCode` 是否拼写正确

---

**最后一条规则**：如果你（AI）不确定一个改动会不会影响主题同步、权限隔离、类型检查三件套，**先读相关文件再下手**。错了的代价是测试全红 + 主题错乱 + 权限穿模。
