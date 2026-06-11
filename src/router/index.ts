import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', layout: 'blank' },
  },
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '数据看板', icon: 'Odometer', roles: ['admin', 'operator', 'viewer'] },
      },
      {
        path: 'audit',
        name: 'Audit',
        component: () => import('@/views/audit/index.vue'),
        meta: {
          title: '内容审核',
          icon: 'CircleCheck',
          roles: ['admin', 'operator', 'viewer'],
          perm: 'audit:view',
        },
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/index.vue'),
        meta: {
          title: '用户管理',
          icon: 'User',
          roles: ['admin', 'operator', 'viewer'],
          perm: 'user:view',
        },
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/views/analytics/index.vue'),
        meta: { title: '数据分析', icon: 'TrendCharts', roles: ['admin', 'operator'] },
      },
      {
        path: 'logs',
        name: 'Logs',
        component: () => import('@/views/logs/index.vue'),
        meta: { title: '操作日志', icon: 'Document', roles: ['admin', 'operator'] },
      },
    ],
  },
  // 大屏独立路径(不走 AdminLayout,无侧边栏 / 顶栏 DOM)
  {
    path: '/bigscreen',
    name: 'Bigscreen',
    component: () => import('@/views/bigscreen/index.vue'),
    meta: {
      title: '数据大屏',
      icon: 'Monitor',
      roles: ['admin', 'operator', 'viewer'],
      perm: 'bigscreen:view',
      layout: 'standalone',
    },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/404/index.vue'),
    meta: { title: '页面不存在', layout: 'blank' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} · StreamHub Admin`
  }
  const token = localStorage.getItem('admin-token')
  if (to.path === '/login') {
    if (token) return next('/')
    return next()
  }
  if (!token) {
    return next('/login')
  }
  // 角色守卫
  const roles = JSON.parse(localStorage.getItem('admin-roles') || '["admin"]')
  const requiredRoles = (to.meta.roles as string[] | undefined) || []
  if (requiredRoles.length > 0 && !requiredRoles.some((r) => roles.includes(r))) {
    return next('/dashboard')
  }
  next()
})

export default router

// ===== 菜单配置:扁平 + 按角色过滤 =====
export interface MenuItem {
  path: string
  title: string
  icon: string
}

export function getAccessibleRoutes(roles: string[]): MenuItem[] {
  const result: MenuItem[] = []
  function walk(list: RouteRecordRaw[], base = '') {
    for (const r of list) {
      // 排除登录/404(没有菜单项意义)
      if (r.meta?.layout === 'blank') continue
      // 角色过滤
      if (r.meta?.roles && !(r.meta.roles as string[]).some((role) => roles.includes(role))) continue
      // 是菜单项(有 title + icon)
      if (r.meta?.title && r.meta?.icon) {
        const fullPath = r.path.startsWith('/') ? r.path : (base + '/' + r.path).replace(/\/+/g, '/')
        result.push({
          path: fullPath,
          title: r.meta.title as string,
          icon: r.meta.icon as string,
        })
      }
      // 递归子路由
      if (r.children) walk(r.children, r.path || base)
    }
  }
  walk(routes)
  return result
}
