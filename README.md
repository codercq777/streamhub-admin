# StreamHub Admin

StreamHub 小程序的内容审核 / 用户管理 / 数据分析后台。

> 配套小程序: [streamhub-uniapp](https://github.com/codercq777/streamhub-uniapp)

## 技术栈

- **框架**: Vue 3.5 + TypeScript
- **构建**: Vite 8
- **UI**: Element Plus 2.14
- **状态**: Pinia 3
- **路由**: Vue Router 4
- **图表**: ECharts 6 + vue-echarts
- **样式**: SCSS + CSS 变量(亮 / 暗双主题)

## 功能模块

| 模块 | 路径 | 说明 |
| --- | --- | --- |
| 数据看板 | `/dashboard` | 指标卡 / 用户增长 / 本周发布 / 待审核 / 系统健康度 |
| 内容审核 | `/audit` | 待审 / 已通过 / 已拒绝 状态 tab,详情抽屉,批量操作 |
| 用户管理 | `/users` | 4 项统计 + 搜索 / 筛选 / 封禁 / 解封 / 详情 |
| 数据分析 | `/analytics` | 分类占比 / 转化漏斗 / 24h 热力 / 流量来源 / 留存 |

## 快速开始

```bash
npm install
npm run dev      # http://localhost:8083
npm run build
```

体验账号:`admin` / `admin123`(任意非空,前端 mock 登录)

## 主题

通过 `src/styles/var.scss` 调整品牌色,通过 `<html class="dark">` 切换暗色模式。
Element Plus 的 CSS 变量在 `src/styles/index.scss` 覆盖,主色统一为 `#ff2442`(与 StreamHub 小程序呼应)。

## 目录结构

```
src/
├── api/mock.ts         # 前端 mock 数据
├── layouts/            # 布局(AdminLayout)
├── router/             # 路由 + 守卫
├── stores/             # pinia
├── styles/             # 主题 + 全局
├── types/              # TS 类型 + 自动生成 d.ts
├── utils/              # axios / echarts / format
└── views/
    ├── login/
    ├── dashboard/
    ├── audit/
    ├── users/
    ├── analytics/
    └── 404/
```

## License

MIT
