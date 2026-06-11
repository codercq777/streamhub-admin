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
        path: 'bigscreen',
        name: 'Bigscreen',
        component: () => import('@/views/bigscreen/index.vue'),
        meta: {
          title: '数据大屏',
          icon: 'Monitor',
          roles: ['admin', 'operator', 'viewer'],
          perm: 'bigscreen:view',
        },
      },
      {
        path: 'logs',
        name: 'Logs',
        component: () => import('@/views/logs/index.vue'),
        meta: { title: '操作日志', icon: 'Document', roles: ['admin', 'operator'] },
      },
    ],
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

// 导出供侧边栏过滤菜单用
export function getAccessibleRoutes(roles: string[]) {
  function walk(list: RouteRecordRaw[]): any[] {
    return list
      .filter((r) => {
        if (r.meta?.layout === 'blank') return false
        if (!r.meta?.roles) return true
        return (r.meta.roles as string[]).some((role) => roles.includes(role))
      })
      .map((r) => ({
        path: r.path,
        title: r.meta?.title,
        icon: r.meta?.icon,
        children: r.children ? walk(r.children) : undefined,
      }))
  }
  return walk(routes)
}
