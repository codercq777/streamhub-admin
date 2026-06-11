<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { ElMessage } from "element-plus"
import { mockNotes } from '@/api/mock'
import { compact, formatDate, relativeTime } from '@/utils/format'
import { useLogStore } from '@/stores/log'
import type { NoteItem } from '@/types'

const allNotes = ref<NoteItem[]>([...mockNotes])
const activeStatus = ref<'all' | 'pending' | 'approved' | 'rejected'>('pending')
const searchKeyword = ref('')
const categoryFilter = ref<string>('')
const selected = ref<number[]>([])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

const detailVisible = ref(false)
const detailNote = ref<NoteItem | null>(null)
const rejectDialog = ref({ visible: false, noteId: 0, reason: '' })

const logStore = useLogStore()

const statusMap = {
  pending: { label: '待审核', type: 'warning' as const, color: '#ff9f43' },
  approved: { label: '已通过', type: 'success' as const, color: '#16c099' },
  rejected: { label: '已拒绝', type: 'danger' as const, color: '#ff4757' },
}

const categories = computed(() =>
  Array.from(new Set(allNotes.value.map((n) => n.category)))
)

// 过滤
const filtered = computed(() => {
  return allNotes.value.filter((n) => {
    if (activeStatus.value !== 'all' && n.status !== activeStatus.value) return false
    if (categoryFilter.value && n.category !== categoryFilter.value) return false
    if (searchKeyword.value) {
      const k = searchKeyword.value.toLowerCase()
      return (
        n.title.toLowerCase().includes(k) ||
        n.authorName.toLowerCase().includes(k)
      )
    }
    return true
  })
})

// 分页后表格数据
const tableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

// 切换筛选时回到第一页
function resetPage() {
  currentPage.value = 1
}

watch([activeStatus, searchKeyword, categoryFilter], () => {
  resetPage()
})

// 各状态数量
const countOf = (s: 'all' | NoteItem['status']) =>
  s === 'all' ? allNotes.value.length : allNotes.value.filter((n) => n.status === s).length

// 表格选中
function onSelect(selection: NoteItem[]) {
  selected.value = selection.map((n) => n.id)
}

function clearSelection() {
  selected.value = []
}

// 操作
function approve(note: any) {
  const idx = allNotes.value.findIndex((n) => n.id === note.id)
  if (idx >= 0) {
    allNotes.value[idx] = { ...note, status: 'approved', rejectReason: undefined }
    ElMessage.success(`已通过:${note.title}`)
    logStore.addLog({
      type: 'audit_approve',
      action: '审核通过',
      target: `笔记 #${note.id}《${note.title}》`,
    })
  }
}

function batchApprove() {
  if (!selected.value.length) {
    ElMessage.warning('请先选择内容')
    return
  }
  allNotes.value = allNotes.value.map((n) =>
    selected.value.includes(n.id)
      ? { ...n, status: 'approved' as const, rejectReason: undefined }
      : n
  )
  ElMessage.success(`已批量通过 ${selected.value.length} 条`)
  logStore.addLog({
    type: 'audit_batch',
    action: '批量审核通过',
    target: `${selected.value.length} 条笔记`,
  })
  clearSelection()
}

function openReject(note: any) {
  rejectDialog.value = { visible: true, noteId: note.id, reason: '' }
}

function confirmReject() {
  if (!rejectDialog.value.reason.trim()) {
    ElMessage.warning('请填写拒绝原因')
    return
  }
  const note = allNotes.value.find((n) => n.id === rejectDialog.value.noteId)
  allNotes.value = allNotes.value.map((n) =>
    n.id === rejectDialog.value.noteId
      ? { ...n, status: 'rejected' as const, rejectReason: rejectDialog.value.reason }
      : n
  )
  ElMessage.success('已拒绝')
  if (note) {
    logStore.addLog({
      type: 'audit_reject',
      action: '审核拒绝',
      target: `笔记 #${note.id}《${note.title}》 - ${rejectDialog.value.reason}`,
    })
  }
  rejectDialog.value.visible = false
}

function showDetail(note: any) {
  detailNote.value = note
  detailVisible.value = true
}
</script>

<template>
  <div class="audit-page">
    <!-- 顶部状态 tab -->
    <div class="status-tabs">
      <div
        v-for="s in (['all','pending','approved','rejected'] as const)"
        :key="s"
        class="status-tab"
        :class="{ active: activeStatus === s }"
        :style="activeStatus === s && s !== 'all' ? { borderColor: statusMap[s].color, color: statusMap[s].color } : {}"
        @click="activeStatus = s; clearSelection()"
      >
        <span class="tab-label">
          {{ s === 'all' ? '全部' : statusMap[s].label }}
        </span>
        <span class="tab-count num">{{ countOf(s) }}</span>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="card toolbar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索标题或作者"
        clearable
        :prefix-icon="'Search'"
        class="search-input"
      />
      <el-select
        v-model="categoryFilter"
        placeholder="全部分类"
        clearable
        class="category-select"
      >
        <el-option
          v-for="c in categories"
          :key="c"
          :label="c"
          :value="c"
        />
      </el-select>
      <div class="toolbar-spacer"></div>
      <el-button
        v-permission="'audit:batch'"
        type="primary"
        :disabled="!selected.length"
        @click="batchApprove"
      >
        <el-icon><Check /></el-icon>
        批量通过 ({{ selected.length }})
      </el-button>
    </div>

    <!-- 列表 -->
    <el-table
      :data="tableData"
      @selection-change="onSelect"
      class="audit-table"
      :header-cell-style="{ background: '#fafbfc', color: '#6b7280', fontWeight: 500 }"
      empty-text="暂无内容"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column label="内容" min-width="380">
        <template #default="{ row }">
          <div class="content-cell" @click="showDetail(row)">
            <el-image
              :src="row.cover"
              :preview-src-list="[row.cover]"
              fit="cover"
              class="content-cover"
              :hide-on-click-modal="true"
              preview-teleported
            />
            <div class="content-info">
              <div class="content-title">{{ row.title }}</div>
              <div class="content-excerpt">{{ row.content }}</div>
              <div class="content-tags">
                <el-tag
                  v-for="t in row.tags"
                  :key="t"
                  size="small"
                  effect="plain"
                  type="info"
                >
                  #{{ t }}
                </el-tag>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="作者" width="160">
        <template #default="{ row }">
          <div class="author-cell">
            <el-avatar :src="row.authorAvatar" :size="32" />
            <span class="author-name">{{ row.authorName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="分类" width="90">
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ row.category }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="互动" width="120" align="center">
        <template #default="{ row }">
          <div class="stat-pair">
            <span><el-icon><Star /></el-icon> {{ compact(row.likes) }}</span>
            <span><el-icon><ChatDotRound /></el-icon> {{ compact(row.comments) }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="提交时间" width="140">
        <template #default="{ row }">
          <div class="time-cell">
            <div>{{ formatDate(row.createdAt, false) }}</div>
            <div class="time-rel">{{ relativeTime(row.createdAt) }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <span
            class="status-dot"
            :style="{
              background: (statusMap as any)[row.status].color + '20',
              color: (statusMap as any)[row.status].color,
            }"
          >
            <span class="dot" :style="{ background: (statusMap as any)[row.status].color }"></span>
            {{ (statusMap as any)[row.status].label }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right" align="center">
        <template #default="{ row }">
          <template v-if="row.status === 'pending'">
            <el-button size="small" type="success" plain @click="approve(row)">
              通过
            </el-button>
            <el-button size="small" type="danger" plain @click="openReject(row)">
              拒绝
            </el-button>
          </template>
          <el-button v-else size="small" text type="primary" @click="showDetail(row)">
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="filtered.length"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        background
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="detailVisible"
      title="内容详情"
      size="600px"
      direction="rtl"
    >
      <template v-if="detailNote">
        <div class="detail-wrap">
          <el-image
            :src="detailNote.cover"
            fit="cover"
            class="detail-cover"
          />
          <h2 class="detail-title">{{ detailNote.title }}</h2>
          <div class="detail-author">
            <el-avatar :src="detailNote.authorAvatar" :size="40" />
            <div>
              <div class="detail-author-name">{{ detailNote.authorName }}</div>
              <div class="detail-author-time">{{ formatDate(detailNote.createdAt) }}</div>
            </div>
            <div class="detail-status-spacer"></div>
            <span
              class="status-dot"
              :style="{
                background: statusMap[detailNote.status].color + '20',
                color: statusMap[detailNote.status].color,
              }"
            >
              {{ statusMap[detailNote.status].label }}
            </span>
          </div>
          <div class="detail-body">{{ detailNote.content }}</div>
          <div class="detail-tags">
            <el-tag
              v-for="t in detailNote.tags"
              :key="t"
              size="small"
              effect="plain"
              type="info"
            >#{{ t }}</el-tag>
          </div>
          <div v-if="detailNote.rejectReason" class="detail-reject">
            <el-icon><WarningFilled /></el-icon>
            <span>拒绝原因:{{ detailNote.rejectReason }}</span>
          </div>

          <div class="detail-actions">
            <el-button
              v-if="detailNote.status === 'pending'"
              type="primary"
              @click="approve(detailNote); detailVisible = false"
            >
              <el-icon><Check /></el-icon>通过
            </el-button>
            <el-button
              v-if="detailNote.status === 'pending'"
              type="danger"
              plain
              @click="openReject(detailNote); detailVisible = false"
            >
              <el-icon><Close /></el-icon>拒绝
            </el-button>
          </div>
        </div>
      </template>
    </el-drawer>

    <!-- 拒绝弹窗 -->
    <el-dialog
      v-model="rejectDialog.visible"
      title="拒绝内容"
      width="480px"
    >
      <el-form label-position="top">
        <el-form-item label="拒绝原因" required>
          <el-input
            v-model="rejectDialog.reason"
            type="textarea"
            :rows="4"
            placeholder="请填写拒绝原因,会展示给作者..."
          />
        </el-form-item>
        <el-form-item>
          <div class="quick-reasons">
            <el-tag
              v-for="r in ['内容含有违规信息','标题党 / 误导性','重复内容','图文不符','其他']"
              :key="r"
              class="quick-reason"
              :effect="rejectDialog.reason === r ? 'dark' : 'plain'"
              @click="rejectDialog.reason = r"
            >{{ r }}</el-tag>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.audit-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// ===== 状态 tab =====
.status-tabs {
  display: flex;
  gap: 12px;
}

.status-tab {
  flex: 1;
  padding: 16px 20px;
  background: #fff;
  border-radius: $radius-md;
  border: 1px solid $border-light;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all $transition;
  font-size: 14px;
  color: $text-secondary;
  &:hover {
    border-color: $primary-light;
    color: $primary;
    transform: translateY(-1px);
    box-shadow: $shadow-sm;
  }
  &.active {
    border-color: $primary;
    color: $primary;
    background: linear-gradient(135deg, #fff 0%, #fff5f6 100%);
    font-weight: 600;
  }
}
html.dark .status-tab {
  background: #0f172a;
  border-color: #1e293b;
  &:hover { background: #1e293b; }
  &.active {
    border-color: $primary;
    color: $primary;
    background: linear-gradient(135deg, #0f172a 0%, rgba(255,36,66,0.08) 100%);
  }
}

.tab-label { font-weight: 500; }

.tab-count {
  background: $bg-page;
  color: $text-tertiary;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
}
html.dark .tab-count { background: #1e293b; }

.status-tab.active .tab-count {
  background: $primary;
  color: #fff;
}

// ===== 工具栏 =====
.toolbar {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input { width: 280px; }

.category-select { width: 160px; }

.toolbar-spacer { flex: 1; }

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

// ===== 表格 =====
:deep(.audit-table) {
  border-radius: $radius-lg;
  overflow: hidden;
  .el-table {
    background: #fff;
    border-radius: $radius-lg;
    overflow: hidden;
  }
  .el-table__inner-wrapper::before {
    background: $border-light;
  }
  .el-table__row {
    transition: background $transition;
    &:hover > td {
      background: $bg-hover !important;
    }
  }
}

html.dark :deep(.audit-table .el-table) {
  background: #0f172a;
}

// ===== 内容 cell =====
.content-cell {
  display: flex;
  gap: 12px;
  cursor: pointer;
  padding: 4px 0;
}

.content-cover {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  flex-shrink: 0;
  background: $bg-page;
  overflow: hidden;
}

.content-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.content-title {
  font-size: 14px;
  font-weight: 500;
  color: $text-primary;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
html.dark .content-title { color: #e2e8f0; }

.content-excerpt {
  font-size: 12px;
  color: $text-tertiary;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.content-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

// ===== 作者 cell =====
.author-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-name {
  font-size: 13px;
  color: $text-primary;
  font-weight: 500;
}
html.dark .author-name { color: #e2e8f0; }

// ===== 互动 =====
.stat-pair {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  color: $text-secondary;
  .el-icon { vertical-align: -2px; }
}

// ===== 时间 =====
.time-cell {
  font-size: 12px;
  color: $text-secondary;
}

.time-rel {
  font-size: 11px;
  color: $text-tertiary;
  margin-top: 2px;
}

// ===== 状态点 =====
.status-dot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
}

// ===== 详情 =====
.detail-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-cover {
  width: 100%;
  height: 200px;
  border-radius: $radius-md;
  background: $bg-page;
}

.detail-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: $text-primary;
  line-height: 1.4;
}
html.dark .detail-title { color: #e2e8f0; }

.detail-author {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: $bg-page;
  border-radius: $radius-md;
}
html.dark .detail-author { background: #1e293b; }

.detail-author-name { font-size: 14px; font-weight: 500; color: $text-primary; }
.detail-author-time { font-size: 12px; color: $text-tertiary; }
html.dark .detail-author-name { color: #e2e8f0; }

.detail-status-spacer { flex: 1; }

.detail-body {
  font-size: 14px;
  line-height: 1.8;
  color: $text-primary;
  white-space: pre-wrap;
}
html.dark .detail-body { color: #e2e8f0; }

.detail-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.detail-reject {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: $danger-soft;
  color: $danger;
  border-radius: $radius-md;
  font-size: 13px;
}

.detail-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  padding-top: 20px;
  border-top: 1px solid $border-light;
}
html.dark .detail-actions { border-top-color: #1e293b; }

// ===== 快速原因 =====
.quick-reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.quick-reason {
  cursor: pointer;
  transition: all $transition;
}
</style>
