import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
          meta: { title: '数据看板', icon: 'Odometer' },
        },
        {
          path: 'audit',
          name: 'Audit',
          component: () => import('@/views/audit/index.vue'),
          meta: { title: '内容审核', icon: 'CircleCheck' },
        },
        {
          path: 'users',
          name: 'Users',
          component: () => import('@/views/users/index.vue'),
          meta: { title: '用户管理', icon: 'User' },
        },
        {
          path: 'analytics',
          name: 'Analytics',
          component: () => import('@/views/analytics/index.vue'),
          meta: { title: '数据分析', icon: 'TrendCharts' },
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
  ],
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
  if (!token && to.path !== '/login') {
    return next('/login')
  }
  next()
})

export default router
