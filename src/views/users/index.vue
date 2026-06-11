<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { mockUsers } from '@/api/mock'
import { compact, formatDate } from '@/utils/format'
import { useLogStore } from '@/stores/log'
import type { UserInfo } from '@/types'

const allUsers = ref<UserInfo[]>([...mockUsers])
const searchKeyword = ref('')
const statusFilter = ref<'' | 'active' | 'banned'>('')
const roleFilter = ref<'' | UserInfo['role']>('')

const detailVisible = ref(false)
const detailUser = ref<UserInfo | null>(null)

const logStore = useLogStore()

const stats = computed(() => ({
  total: allUsers.value.length,
  active: allUsers.value.filter((u) => u.status === 'active').length,
  banned: allUsers.value.filter((u) => u.status === 'banned').length,
  new30d: allUsers.value.filter(
    (u) => Date.now() - new Date(u.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
  ).length,
}))

const filtered = computed(() => {
  return allUsers.value.filter((u) => {
    if (statusFilter.value && u.status !== statusFilter.value) return false
    if (roleFilter.value && u.role !== roleFilter.value) return false
    if (searchKeyword.value) {
      const k = searchKeyword.value.toLowerCase()
      return (
        u.username.toLowerCase().includes(k) ||
        u.nickname.toLowerCase().includes(k) ||
        u.email.toLowerCase().includes(k)
      )
    }
    return true
  })
})

const roleMap: Record<UserInfo['role'], { label: string; color: string }> = {
  admin: { label: '管理员', color: '#ff2442' },
  operator: { label: '运营', color: '#2b6fff' },
  viewer: { label: '普通', color: '#6b7280' },
}

const statusMap: Record<UserInfo['status'], { label: string; color: string }> = {
  active: { label: '正常', color: '#16c099' },
  banned: { label: '已封禁', color: '#ff4757' },
}

function banUser(user: UserInfo) {
  ElMessageBox.confirm(
    `确认封禁用户 ${user.nickname}?封禁后将无法登录。`,
    '封禁确认',
    { type: 'warning', confirmButtonText: '确认封禁', cancelButtonText: '取消' }
  ).then(() => {
    const idx = allUsers.value.findIndex((u) => u.id === user.id)
    if (idx >= 0) {
      allUsers.value[idx] = { ...user, status: 'banned' }
      ElMessage.success('已封禁')
      logStore.addLog({
        type: 'user_ban',
        action: '封禁用户',
        target: `user_${user.id} @${user.nickname}`,
      })
    }
  }).catch(() => {})
}

function unbanUser(user: UserInfo) {
  const idx = allUsers.value.findIndex((u) => u.id === user.id)
  if (idx >= 0) {
    allUsers.value[idx] = { ...user, status: 'active' }
    ElMessage.success('已解封')
    logStore.addLog({
      type: 'user_unban',
      action: '解封用户',
      target: `user_${user.id} @${user.nickname}`,
    })
  }
}

function showDetail(user: UserInfo) {
  detailUser.value = user
  detailVisible.value = true
}
</script>

<template>
  <div class="users-page">
    <!-- 顶部统计 -->
    <div class="stat-grid">
      <div class="stat-card stat-total">
        <div class="stat-icon"><el-icon size="22"><UserFilled /></el-icon></div>
        <div>
          <div class="stat-label">总用户数</div>
          <div class="stat-value num">{{ stats.total }}</div>
        </div>
      </div>
      <div class="stat-card stat-active">
        <div class="stat-icon"><el-icon size="22"><CircleCheckFilled /></el-icon></div>
        <div>
          <div class="stat-label">活跃用户</div>
          <div class="stat-value num">{{ stats.active }}</div>
        </div>
      </div>
      <div class="stat-card stat-new">
        <div class="stat-icon"><el-icon size="22"><Plus /></el-icon></div>
        <div>
          <div class="stat-label">30 日新增</div>
          <div class="stat-value num">{{ stats.new30d }}</div>
        </div>
      </div>
      <div class="stat-card stat-banned">
        <div class="stat-icon"><el-icon size="22"><Lock /></el-icon></div>
        <div>
          <div class="stat-label">已封禁</div>
          <div class="stat-value num">{{ stats.banned }}</div>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="card toolbar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索用户名 / 昵称 / 邮箱"
        clearable
        :prefix-icon="'Search'"
        class="search-input"
      />
      <el-select
        v-model="statusFilter"
        placeholder="全部状态"
        clearable
        class="filter-select"
      >
        <el-option label="正常" value="active" />
        <el-option label="已封禁" value="banned" />
      </el-select>
      <el-select
        v-model="roleFilter"
        placeholder="全部角色"
        clearable
        class="filter-select"
      >
        <el-option label="管理员" value="admin" />
        <el-option label="运营" value="operator" />
        <el-option label="普通用户" value="viewer" />
      </el-select>
      <div class="toolbar-spacer"></div>
      <el-button v-permission="'user:create'" type="primary">
        <el-icon><Plus /></el-icon>新建用户
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table
      :data="filtered"
      class="users-table"
      :header-cell-style="{ background: '#fafbfc', color: '#6b7280', fontWeight: 500 }"
      empty-text="暂无用户"
    >
      <el-table-column label="用户" min-width="220">
        <template #default="{ row }">
          <div class="user-cell" @click="showDetail(row)">
            <el-avatar :src="row.avatar" :size="40" />
            <div>
              <div class="user-nick">{{ row.nickname }}</div>
              <div class="user-uid">@{{ row.username }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="邮箱" prop="email" min-width="200">
        <template #default="{ row }">
          <span class="email-text">{{ row.email }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色" width="100">
        <template #default="{ row }">
          <span
            class="role-pill"
            :style="{ color: roleMap[row.role].color, background: roleMap[row.role].color + '15' }"
          >
            {{ roleMap[row.role].label }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <span
            class="status-pill"
            :style="{ color: statusMap[row.status].color, background: statusMap[row.status].color + '15' }"
          >
            <span class="dot" :style="{ background: statusMap[row.status].color }"></span>
            {{ statusMap[row.status].label }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="内容" width="100" align="center">
        <template #default="{ row }">
          <span class="num">{{ row.notesCount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="粉丝" width="100" align="center">
        <template #default="{ row }">
          <span class="num">{{ compact(row.followersCount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="注册时间" width="140">
        <template #default="{ row }">
          <span class="date-text">{{ formatDate(row.createdAt, false) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right" align="center">
        <template #default="{ row }">
          <el-button size="small" text type="primary" @click="showDetail(row)">
            详情
          </el-button>
          <el-button
            v-if="row.status === 'active' && row.role !== 'admin'"
            v-permission="'user:ban'"
            size="small"
            text
            type="danger"
            @click="banUser(row)"
          >
            封禁
          </el-button>
          <el-button
            v-else-if="row.status === 'banned'"
            v-permission="'user:ban'"
            size="small"
            text
            type="success"
            @click="unbanUser(row)"
          >
            解封
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        :total="filtered.length"
        :page-size="10"
        :current-page="1"
        layout="total, prev, pager, next, jumper"
        background
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="detailVisible"
      title="用户详情"
      size="480px"
    >
      <template v-if="detailUser">
        <div class="user-detail">
          <div class="detail-hero">
            <el-avatar :src="detailUser.avatar" :size="80" />
            <div class="detail-hero-name">{{ detailUser.nickname }}</div>
            <div class="detail-hero-uid">@{{ detailUser.username }}</div>
            <div class="detail-hero-tags">
              <span
                class="role-pill"
                :style="{ color: roleMap[detailUser.role].color, background: roleMap[detailUser.role].color + '15' }"
              >{{ roleMap[detailUser.role].label }}</span>
              <span
                class="status-pill"
                :style="{ color: statusMap[detailUser.status].color, background: statusMap[detailUser.status].color + '15' }"
              >
                <span class="dot" :style="{ background: statusMap[detailUser.status].color }"></span>
                {{ statusMap[detailUser.status].label }}
              </span>
            </div>
          </div>

          <div class="detail-stats">
            <div class="ds-block">
              <div class="ds-value num">{{ detailUser.notesCount }}</div>
              <div class="ds-label">发布</div>
            </div>
            <div class="ds-divider"></div>
            <div class="ds-block">
              <div class="ds-value num">{{ compact(detailUser.followersCount) }}</div>
              <div class="ds-label">粉丝</div>
            </div>
            <div class="ds-divider"></div>
            <div class="ds-block">
              <div class="ds-value num">{{ formatDate(detailUser.createdAt, false) }}</div>
              <div class="ds-label">注册</div>
            </div>
          </div>

          <div class="detail-info">
            <div class="info-row">
              <span class="info-key">邮箱</span>
              <span class="info-val">{{ detailUser.email }}</span>
            </div>
            <div class="info-row">
              <span class="info-key">用户 ID</span>
              <span class="info-val num">{{ detailUser.id }}</span>
            </div>
            <div class="info-row">
              <span class="info-key">注册时间</span>
              <span class="info-val">{{ formatDate(detailUser.createdAt) }}</span>
            </div>
          </div>

          <div class="detail-actions">
            <el-button
              v-if="detailUser.status === 'active' && detailUser.role !== 'admin'"
              type="danger"
              plain
              @click="banUser(detailUser)"
            >
              <el-icon><Lock /></el-icon>封禁此用户
            </el-button>
            <el-button
              v-else-if="detailUser.status === 'banned'"
              type="success"
              plain
              @click="unbanUser(detailUser)"
            >
              <el-icon><Unlock /></el-icon>解除封禁
            </el-button>
            <el-button @click="detailVisible = false">关闭</el-button>
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.users-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// ===== 顶部统计卡 =====
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
}

.stat-card {
  background: #fff;
  border-radius: $radius-lg;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid $border-light;
  transition: all $transition;
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
}
html.dark .stat-card { background: #0f172a; border-color: #1e293b; }

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-total .stat-icon { background: $primary-soft; color: $primary; }
.stat-active .stat-icon { background: $success-soft; color: $success; }
.stat-new .stat-icon { background: #dbeafe; color: $blue; }
.stat-banned .stat-icon { background: $danger-soft; color: $danger; }

.stat-label { font-size: 12px; color: $text-secondary; margin-bottom: 4px; }
.stat-value { font-size: 24px; font-weight: 700; color: $text-primary; letter-spacing: -0.5px; }
html.dark .stat-value { color: #e2e8f0; }

// ===== 工具栏 =====
.toolbar {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.search-input { width: 280px; }
.filter-select { width: 140px; }
.toolbar-spacer { flex: 1; }

// ===== 表格 =====
:deep(.users-table) {
  border-radius: $radius-lg;
  overflow: hidden;
  .el-table { background: #fff; border-radius: $radius-lg; overflow: hidden; }
  .el-table__row:hover > td { background: $bg-hover !important; }
}
html.dark :deep(.users-table .el-table) { background: #0f172a; }

// ===== 用户 cell =====
.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.user-nick {
  font-size: 14px;
  font-weight: 500;
  color: $text-primary;
}
html.dark .user-nick { color: #e2e8f0; }
.user-uid { font-size: 12px; color: $text-tertiary; margin-top: 2px; }

.email-text { font-size: 13px; color: $text-secondary; }
.date-text { font-size: 13px; color: $text-secondary; }

// ===== 标签胶囊 =====
.role-pill,
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
}

// ===== 分页 =====
.pagination {
  background: #fff;
  border-radius: $radius-lg;
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  border: 1px solid $border-light;
}
html.dark .pagination { background: #0f172a; border-color: #1e293b; }

// ===== 详情 =====
.user-detail {
  display: flex;
  flex-direction: column;
}

.detail-hero {
  text-align: center;
  padding: 24px 0;
  border-bottom: 1px solid $border-light;
}
html.dark .detail-hero { border-bottom-color: #1e293b; }

.detail-hero-name {
  font-size: 20px;
  font-weight: 700;
  color: $text-primary;
  margin-top: 12px;
}
html.dark .detail-hero-name { color: #e2e8f0; }

.detail-hero-uid {
  font-size: 13px;
  color: $text-tertiary;
  margin-top: 2px;
}

.detail-hero-tags {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 12px;
}

.detail-stats {
  display: flex;
  align-items: center;
  padding: 24px 0;
  border-bottom: 1px solid $border-light;
}
html.dark .detail-stats { border-bottom-color: #1e293b; }

.ds-block {
  flex: 1;
  text-align: center;
}
.ds-value {
  font-size: 20px;
  font-weight: 700;
  color: $text-primary;
}
.ds-label {
  font-size: 12px;
  color: $text-secondary;
  margin-top: 4px;
}
html.dark .ds-value { color: #e2e8f0; }

.ds-divider {
  width: 1px;
  height: 40px;
  background: $border-light;
}
html.dark .ds-divider { background: #1e293b; }

.detail-info {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}
.info-key { color: $text-secondary; }
.info-val { color: $text-primary; font-weight: 500; }
html.dark .info-val { color: #e2e8f0; }

.detail-actions {
  display: flex;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid $border-light;
}
html.dark .detail-actions { border-top-color: #1e293b; }
</style>
