<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const app = useAppStore()
const user = useUserStore()

onMounted(() => {
  app.initTheme()
})

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 面包屑
const breadcrumbs = computed(() => {
  const list = [{ title: '首页', path: '/' }]
  if (route.path !== '/') {
    const matched = router
      .getRoutes()
      .filter((r) => r.path && route.path.startsWith(r.path) && r.meta?.title)
    const last = matched[matched.length - 1]
    if (last && last.path !== '/') {
      list.push({ title: last.meta.title as string, path: last.path })
    }
  }
  return list
})

// 菜单
const menus = [
  { path: '/dashboard', title: '数据看板', icon: 'Odometer' },
  { path: '/audit', title: '内容审核', icon: 'CircleCheck' },
  { path: '/users', title: '用户管理', icon: 'User' },
  { path: '/analytics', title: '数据分析', icon: 'TrendCharts' },
]

function handleLogout() {
  ElMessageBox.confirm('确认退出登录?', '提示', {
    confirmButtonText: '退出',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      user.logout()
      router.push('/login')
    })
    .catch(() => {})
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    document.documentElement.requestFullscreen()
  }
}
</script>

<template>
  <el-container class="admin-layout">
    <!-- ===== 侧边栏 ===== -->
    <el-aside :width="app.sidebarCollapsed ? '64px' : '232px'" class="admin-aside">
      <div class="brand" :class="{ collapsed: app.sidebarCollapsed }">
        <div class="brand-logo">
          <span class="logo-glyph">S</span>
        </div>
        <transition name="brand-fade">
          <div v-show="!app.sidebarCollapsed" class="brand-text-wrap">
            <div class="brand-name brand-text">StreamHub</div>
            <div class="brand-sub">Admin Console</div>
          </div>
        </transition>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="app.sidebarCollapsed"
        class="admin-menu"
        background-color="transparent"
        text-color="rgba(255,255,255,0.85)"
        active-text-color="#ffffff"
        router
      >
        <el-menu-item v-for="m in menus" :key="m.path" :index="m.path">
          <el-icon><component :is="m.icon" /></el-icon>
          <template #title>{{ m.title }}</template>
        </el-menu-item>
      </el-menu>

      <div class="aside-footer" v-show="!app.sidebarCollapsed">
        <div class="aside-footer-tip">
          <el-icon><MagicStick /></el-icon>
          <span>需要帮助?</span>
        </div>
      </div>
    </el-aside>

    <!-- ===== 主区域 ===== -->
    <el-container class="admin-main">
      <!-- 顶栏 -->
      <el-header class="admin-header" height="60px">
        <div class="header-left">
          <el-button
            text
            class="collapse-btn"
            @click="app.toggleSidebar()"
          >
            <el-icon size="20">
              <Fold v-if="!app.sidebarCollapsed" />
              <Expand v-else />
            </el-icon>
          </el-button>

          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item
              v-for="(b, i) in breadcrumbs"
              :key="b.path"
              :to="i === breadcrumbs.length - 1 ? undefined : b.path"
            >
              {{ b.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-tooltip content="刷新页面">
            <el-button text class="header-icon-btn" @click="router.go(0)">
              <el-icon size="18"><Refresh /></el-icon>
            </el-button>
          </el-tooltip>

          <!-- 主题切换 -->
          <el-popover
            placement="bottom-end"
            :width="280"
            trigger="click"
            popper-class="theme-popover"
          >
            <template #reference>
              <el-button text class="header-icon-btn" title="主题">
                <el-icon size="18"><Brush /></el-icon>
              </el-button>
            </template>

            <div class="theme-panel">
              <div class="tp-title">主题色</div>
              <div class="tp-grid">
                <div
                  v-for="t in app.themes"
                  :key="t.name"
                  class="tp-swatch"
                  :class="{ active: app.themeName === t.name }"
                  :style="{ background: t.primary }"
                  @click="app.setTheme(t.name)"
                >
                  <el-icon v-if="app.themeName === t.name" size="14" color="#fff"><Check /></el-icon>
                  <span v-if="t.isDark" class="tp-moon"><el-icon size="10" color="#fff"><Moon /></el-icon></span>
                </div>
              </div>
              <div class="tp-labels">
                <span class="tp-l-hint">浅</span>
                <span class="tp-l-hint tp-l-hint-dark">暗</span>
              </div>
              <div class="tp-divider"></div>
              <div class="tp-row">
                <span class="tp-row-label">暗色模式</span>
                <el-switch
                  :model-value="app.isDark"
                  @change="app.toggleDark()"
                  size="small"
                />
              </div>
              <div class="tp-hint">提示:暗夜紫 / 炭黑主题自带暗色模式</div>
            </div>
          </el-popover>

          <el-tooltip content="全屏">
            <el-button text class="header-icon-btn" @click="toggleFullscreen">
              <el-icon size="18"><FullScreen /></el-icon>
            </el-button>
          </el-tooltip>
          <el-dropdown trigger="click">
            <div class="user-block">
              <el-avatar :src="user.avatar" :size="32" />
              <span class="user-name">{{ user.username || 'admin' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-icon><User /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-icon><Setting /></el-icon>系统设置
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容 -->
      <el-main class="admin-content">
        <router-view v-slot="{ Component, route: r }">
          <transition name="slide" mode="out-in">
            <component :is="Component" :key="r.fullPath" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.admin-layout {
  height: 100vh;
}

// ====== 侧边栏 ======
.admin-aside {
  background: linear-gradient(180deg, #1a0b14 0%, #2a0e1a 50%, #1a0b14 100%);
  position: relative;
  transition: width $transition;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  &::before {
    content: '';
    position: absolute;
    top: -100px;
    right: -100px;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(255, 36, 66, 0.25), transparent 70%);
    pointer-events: none;
  }
  &::after {
    content: '';
    position: absolute;
    bottom: -100px;
    left: -100px;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(196, 77, 255, 0.15), transparent 70%);
    pointer-events: none;
  }
}

.brand {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  position: relative;
  z-index: 1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &.collapsed {
    justify-content: center;
    padding: 0;
  }
}

.brand-logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: $brand-gradient;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.4);
  flex-shrink: 0;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    inset: 1px;
    border-radius: 9px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.2), transparent);
    pointer-events: none;
  }
}

.logo-glyph {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
}

.brand-text-wrap {
  overflow: hidden;
  white-space: nowrap;
}

.brand-name {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
}

.brand-sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
  letter-spacing: 0.5px;
}

.admin-menu {
  flex: 1;
  border: none;
  padding: 16px 12px;
  position: relative;
  z-index: 1;
  overflow-y: auto;
  overflow-x: hidden;
  &::-webkit-scrollbar {
    width: 4px;
  }
  :deep(.el-menu-item) {
    border-radius: 10px;
    margin-bottom: 4px;
    height: 44px;
    line-height: 44px;
    transition: all $transition;
    position: relative;
    &:hover {
      background: rgba(255, 255, 255, 0.06) !important;
      color: #fff !important;
    }
    &.is-active {
      background: $brand-gradient !important;
      color: #fff !important;
      box-shadow: 0 4px 12px rgba(255, 36, 66, 0.35);
      &::before {
        content: '';
        position: absolute;
        left: -12px;
        top: 8px;
        bottom: 8px;
        width: 3px;
        background: #fff;
        border-radius: 0 2px 2px 0;
      }
    }
  }
  :deep(.el-menu--collapse .el-menu-item) {
    margin: 4px 8px;
  }
}

.aside-footer {
  padding: 12px 16px 20px;
  position: relative;
  z-index: 1;
}

.aside-footer-tip {
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  gap: 6px;
}

.brand-fade-enter-active,
.brand-fade-leave-active {
  transition: opacity 0.2s ease;
}
.brand-fade-enter-from,
.brand-fade-leave-to {
  opacity: 0;
}

// ====== 主区域 ======
.admin-main {
  background: $bg-page;
  height: 100vh;
  overflow: hidden;
}

.admin-header {
  background: #fff;
  border-bottom: 1px solid $border;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
  position: relative;
  z-index: 10;
}

html.dark .admin-header {
  background: #0f172a;
  border-bottom-color: #1e293b;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: $text-secondary;
  &:hover {
    background: $bg-hover;
    color: $primary;
  }
}

.breadcrumb {
  font-size: 14px;
  :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
    color: $text-primary;
    font-weight: 500;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: $text-secondary;
  &:hover {
    background: $bg-hover;
    color: $primary;
  }
}

.user-block {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 4px;
  border-radius: 999px;
  cursor: pointer;
  transition: background $transition;
  margin-left: 8px;
  &:hover {
    background: $bg-hover;
  }
}

.user-name {
  font-size: 13px;
  color: $text-primary;
  font-weight: 500;
}

html.dark .user-name {
  color: #e2e8f0;
}

.admin-content {
  padding: 20px;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

// 切换动画
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
