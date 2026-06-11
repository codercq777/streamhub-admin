<script setup lang="ts">
import { computed, ref } from 'vue'
import VChart from 'vue-echarts'
import { mockMetrics, mockGrowthData, mockPublishData, mockNotes } from '@/api/mock'
import { compact, relativeTime } from '@/utils/format'

// 图表区间切换
const chartRange = ref(1) // 1=30天 2=7天 3=24小时

// 指标卡配色
const colorMap: Record<string, [string, string, string]> = {
  primary: ['#fff5f6', '#ff6470', '#ff2442'],
  success: ['#d1fae5', '#16c099', '#0e9276'],
  warning: ['#fef3c7', '#ff9f43', '#d97706'],
  purple: ['#f3e8ff', '#c44dff', '#9333ea'],
}

// ===== 折线图 option =====
const lineOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderColor: '#eee',
    textStyle: { color: '#1f2937' },
  },
  legend: {
    data: ['UV', 'PV'],
    right: 0,
    textStyle: { color: '#6b7280' },
  },
  grid: { left: 30, right: 16, top: 36, bottom: 24 },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: mockGrowthData.map((d) => d.date),
    axisLine: { lineStyle: { color: '#e5e7eb' } },
    axisLabel: { color: '#9ca3af', fontSize: 11 },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
    axisLabel: { color: '#9ca3af', fontSize: 11, formatter: (v: number) => compact(v) },
  },
  series: [
    {
      name: 'UV',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: mockGrowthData.map((d) => d.uv),
      itemStyle: { color: '#ff2442' },
      lineStyle: { width: 3, color: '#ff2442' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(255,36,66,0.4)' },
            { offset: 1, color: 'rgba(255,36,66,0)' },
          ],
        },
      },
    },
    {
      name: 'PV',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: mockGrowthData.map((d) => d.pv),
      itemStyle: { color: '#2b6fff' },
      lineStyle: { width: 3, color: '#2b6fff' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(43,111,255,0.3)' },
            { offset: 1, color: 'rgba(43,111,255,0)' },
          ],
        },
      },
    },
  ],
}))

// ===== 柱状图 =====
const barOption = computed(() => ({
  tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)' },
  grid: { left: 30, right: 16, top: 20, bottom: 24 },
  xAxis: {
    type: 'category',
    data: mockPublishData.map((d) => d.day),
    axisLine: { lineStyle: { color: '#e5e7eb' } },
    axisLabel: { color: '#9ca3af', fontSize: 11 },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
    axisLabel: { color: '#9ca3af', fontSize: 11 },
  },
  series: [
    {
      type: 'bar',
      data: mockPublishData.map((d) => d.count),
      barWidth: 28,
      itemStyle: {
        borderRadius: [8, 8, 0, 0],
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#ff6470' },
            { offset: 1, color: '#c44dff' },
          ],
        },
      },
    },
  ],
}))

// 最近待审核(取 5 条)
const pendingNotes = computed(() =>
  mockNotes.filter((n) => n.status === 'pending').slice(0, 5)
)

// 系统状态
const systemStatus = ref([
  { label: 'API 服务', value: 99.98, color: '#16c099' },
  { label: 'CDN 节点', value: 99.95, color: '#16c099' },
  { label: '数据库', value: 99.99, color: '#16c099' },
  { label: '消息队列', value: 98.4, color: '#ff9f43' },
])
</script>

<template>
  <div class="dashboard">
    <!-- ====== 欢迎条 ====== -->
    <div class="welcome fade-in">
      <div>
        <h2 class="welcome-title">
          下午好,<span class="brand-text">admin</span> 👋
        </h2>
        <p class="welcome-sub">今日有 18 条内容待审核,3 位新用户等待激活。</p>
      </div>
      <div class="welcome-meta">
        <div class="date-block">
          <div class="date-day">11</div>
          <div class="date-rest">
            <div>2026 / 06</div>
            <div>星期四</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== 指标卡 ====== -->
    <div class="metric-grid">
      <div
        v-for="(m, i) in mockMetrics"
        :key="m.label"
        class="metric-card hover-lift fade-in"
        :style="{ animationDelay: `${i * 60}ms` }"
      >
        <div
          class="metric-icon"
          :style="{
            background: colorMap[m.color][0],
            color: colorMap[m.color][1],
            boxShadow: `0 8px 18px ${colorMap[m.color][0]}`,
          }"
        >
          <el-icon size="22"><component :is="m.icon" /></el-icon>
        </div>
        <div class="metric-body">
          <div class="metric-label">{{ m.label }}</div>
          <div class="metric-value num">
            {{ m.value }}<span class="metric-suffix">{{ m.suffix }}</span>
          </div>
          <div class="metric-trend" :class="{ up: m.trendUp, down: !m.trendUp }">
            <el-icon size="12">
              <CaretTop v-if="m.trendUp" />
              <CaretBottom v-else />
            </el-icon>
            <span>{{ Math.abs(m.trend) }}%</span>
            <span class="trend-cmp">较昨日</span>
          </div>
        </div>
        <!-- 装饰背景 -->
        <div
          class="metric-bg"
          :style="{
            background: `linear-gradient(135deg, ${colorMap[m.color][0]}, transparent)`,
          }"
        ></div>
      </div>
    </div>

    <!-- ====== 图表区 ====== -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="16">
        <div class="card chart-card fade-in" style="animation-delay: 280ms">
          <div class="card-head">
            <div>
              <h3 class="card-title">用户增长趋势</h3>
              <p class="card-sub">近 30 天 UV / PV 数据</p>
            </div>
            <el-radio-group v-model="chartRange" size="small">
              <el-radio-button :value="1">30 天</el-radio-button>
              <el-radio-button :value="2">7 天</el-radio-button>
              <el-radio-button :value="3">24 小时</el-radio-button>
            </el-radio-group>
          </div>
          <div class="chart-area">
            <v-chart :option="lineOption" autoresize />
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="8">
        <div class="card chart-card fade-in" style="animation-delay: 340ms">
          <div class="card-head">
            <div>
              <h3 class="card-title">本周发布</h3>
              <p class="card-sub">近 7 天内容发布数</p>
            </div>
          </div>
          <div class="chart-area">
            <v-chart :option="barOption" autoresize />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- ====== 列表 + 系统状态 ====== -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="14">
        <div class="card fade-in" style="animation-delay: 400ms">
          <div class="card-head">
            <div>
              <h3 class="card-title">最新待审核</h3>
              <p class="card-sub">优先处理用户最新提交</p>
            </div>
            <el-button text type="primary" @click="$router.push('/audit')">
              查看全部
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          <div class="pending-list">
            <div
              v-for="n in pendingNotes"
              :key="n.id"
              class="pending-item hover-lift"
            >
              <el-avatar :src="n.authorAvatar" :size="40" />
              <div class="pending-content">
                <div class="pending-title">{{ n.title }}</div>
                <div class="pending-meta">
                  <span>{{ n.authorName }}</span>
                  <el-divider direction="vertical" />
                  <el-tag size="small" effect="plain" type="info">{{ n.category }}</el-tag>
                  <el-divider direction="vertical" />
                  <span>{{ relativeTime(n.createdAt) }}</span>
                </div>
              </div>
              <el-button size="small" type="primary" plain @click="$router.push('/audit')">审核</el-button>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="10">
        <div class="card fade-in" style="animation-delay: 460ms">
          <div class="card-head">
            <div>
              <h3 class="card-title">系统健康度</h3>
              <p class="card-sub">实时监控各项服务状态</p>
            </div>
          </div>
          <div class="status-list">
            <div v-for="s in systemStatus" :key="s.label" class="status-item">
              <div class="status-label">
                <span class="dot" :style="{ background: s.color }"></span>
                {{ s.label }}
              </div>
              <div class="status-bar">
                <div
                  class="status-bar-fill"
                  :style="{
                    width: s.value + '%',
                    background: s.color,
                  }"
                ></div>
              </div>
              <div class="status-value num">{{ s.value }}%</div>
            </div>
          </div>
          <div class="status-divider"></div>
          <div class="status-footer">
            <div class="stat-block">
              <div class="stat-label">运行时长</div>
              <div class="stat-value num">128 天 04:23:11</div>
            </div>
            <div class="stat-block">
              <div class="stat-label">当前在线</div>
              <div class="stat-value num">3,287</div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// ===== 欢迎条 =====
.welcome {
  background: linear-gradient(135deg, #fff 0%, #fff5f6 100%);
  border-radius: $radius-lg;
  padding: 24px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: $shadow-sm;
  border: 1px solid $border-light;
}
html.dark .welcome {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-color: #1e293b;
}

.welcome-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 6px;
  color: $text-primary;
  letter-spacing: -0.5px;
}
.welcome-sub {
  font-size: 13px;
  color: $text-secondary;
  margin: 0;
}
html.dark .welcome-title { color: #e2e8f0; }

.date-block {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 8px 16px 8px 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}
html.dark .date-block { background: #0f172a; }

.date-day {
  font-size: 28px;
  font-weight: 800;
  background: $brand-gradient;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
}

.date-rest {
  font-size: 12px;
  color: $text-secondary;
  line-height: 1.5;
}

// ===== 指标卡 =====
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.metric-card {
  background: #fff;
  border-radius: $radius-lg;
  padding: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: $shadow-sm;
  border: 1px solid $border-light;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}
html.dark .metric-card {
  background: #0f172a;
  border-color: #1e293b;
}

.metric-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-body {
  flex: 1;
  min-width: 0;
}

.metric-label {
  font-size: 13px;
  color: $text-secondary;
  margin-bottom: 6px;
}

.metric-value {
  font-size: 26px;
  font-weight: 700;
  color: $text-primary;
  line-height: 1.2;
  letter-spacing: -0.5px;
}
html.dark .metric-value { color: #e2e8f0; }

.metric-suffix {
  font-size: 13px;
  font-weight: 500;
  color: $text-secondary;
  margin-left: 2px;
}

.metric-trend {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 999px;
  &.up { color: #16c099; background: $success-soft; }
  &.down { color: #ff4757; background: $danger-soft; }
  .trend-cmp {
    color: $text-tertiary;
    font-weight: 400;
    margin-left: 2px;
  }
}

.metric-bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  filter: blur(30px);
  opacity: 0.6;
  pointer-events: none;
}

// ===== 通用 card =====
.card {
  background: #fff;
  border-radius: $radius-lg;
  padding: 24px;
  box-shadow: $shadow-sm;
  border: 1px solid $border-light;
}
html.dark .card {
  background: #0f172a;
  border-color: #1e293b;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
  margin: 0;
}
html.dark .card-title { color: #e2e8f0; }

.card-sub {
  font-size: 12px;
  color: $text-secondary;
  margin: 4px 0 0;
}

.chart-card .chart-area {
  height: 320px;
}

.chart-row {
  margin-bottom: 0;
  :deep(.el-row) { margin-bottom: 0; }
}

// ===== 待审核列表 =====
.pending-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pending-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: $radius-md;
  transition: all $transition;
  cursor: pointer;
  &:hover {
    background: $bg-hover;
  }
}

.pending-content {
  flex: 1;
  min-width: 0;
}

.pending-title {
  font-size: 14px;
  font-weight: 500;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}
html.dark .pending-title { color: #e2e8f0; }

.pending-meta {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: $text-tertiary;
  gap: 0;
}

// ===== 系统状态 =====
.status-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.status-item {
  display: grid;
  grid-template-columns: 100px 1fr 60px;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.status-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: $text-primary;
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    box-shadow: 0 0 0 4px currentColor;
    opacity: 0.9;
  }
}
html.dark .status-label { color: #e2e8f0; }

.status-bar {
  height: 6px;
  background: $bg-active;
  border-radius: 999px;
  overflow: hidden;
}
html.dark .status-bar { background: #1e293b; }

.status-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s ease;
}

.status-value {
  text-align: right;
  color: $text-secondary;
  font-weight: 500;
}

.status-divider {
  height: 1px;
  background: $border-light;
  margin: 20px 0 16px;
}
html.dark .status-divider { background: #1e293b; }

.status-footer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-block {
  text-align: center;
  padding: 12px;
  background: $bg-page;
  border-radius: $radius-md;
}
html.dark .stat-block { background: #1e293b; }

.stat-label {
  font-size: 12px;
  color: $text-secondary;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: $text-primary;
}
html.dark .stat-value { color: #e2e8f0; }
</style>
