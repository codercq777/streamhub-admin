<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { mockCategoryData, mockFunnelData, mockHeatmap } from '@/api/mock'

// ===== 饼图 =====
const pieOption = computed(() => ({
  tooltip: { trigger: 'item', backgroundColor: 'rgba(255,255,255,0.95)' },
  legend: {
    orient: 'vertical',
    right: 0,
    top: 'center',
    textStyle: { color: '#6b7280', fontSize: 12 },
    itemWidth: 10,
    itemHeight: 10,
  },
  series: [
    {
      type: 'pie',
      radius: ['55%', '78%'],
      center: ['38%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      labelLine: { show: false },
      data: mockCategoryData.map((d, i) => ({
        ...d,
        itemStyle: {
          color: [
            '#ff2442', '#ff6470', '#ff9f43', '#16c099', '#2b6fff', '#c44dff', '#06b6d4',
          ][i % 7],
        },
      })),
    },
  ],
}))

// ===== 漏斗图 =====
const funnelOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c}', backgroundColor: 'rgba(255,255,255,0.95)' },
  series: [
    {
      type: 'funnel',
      left: '10%',
      right: '10%',
      top: 20,
      bottom: 20,
      width: '80%',
      min: 0,
      max: 10000,
      sort: 'descending',
      gap: 4,
      label: {
        show: true,
        position: 'inside',
        formatter: '{b}\n{c}',
        color: '#fff',
        fontSize: 12,
        fontWeight: 500,
      },
      labelLine: { show: false },
      itemStyle: { borderColor: '#fff', borderWidth: 2 },
      data: mockFunnelData.map((d, i) => ({
        ...d,
        itemStyle: {
          color: [
            '#ff2442', '#ff6470', '#ff9f43', '#16c099', '#2b6fff',
          ][i],
        },
      })),
    },
  ],
}))

// ===== 24h 热力图 =====
const heatmapOption = computed(() => {
  const days = mockHeatmap.map((d) => d.day)
  const hours = Array.from({ length: 24 }, (_, h) => `${h}:00`)
  const data: [number, number, number][] = []
  mockHeatmap.forEach((d, di) => {
    d.hours.forEach((v, hi) => data.push([hi, di, v]))
  })
  return {
    tooltip: {
      position: 'top',
      formatter: (p: any) => `${days[p.value[1]]} ${hours[p.value[0]]}<br/>活跃度: ${p.value[2]}`,
      backgroundColor: 'rgba(255,255,255,0.95)',
    },
    grid: { left: 50, right: 20, top: 20, bottom: 60 },
    xAxis: {
      type: 'category',
      data: hours,
      splitArea: { show: true },
      axisLabel: { color: '#9ca3af', fontSize: 10, interval: 2 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'category',
      data: days,
      splitArea: { show: true },
      axisLabel: { color: '#9ca3af', fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 10,
      itemWidth: 12,
      itemHeight: 100,
      text: ['高', '低'],
      textStyle: { color: '#6b7280', fontSize: 11 },
      inRange: { color: ['#fff5f6', '#ffcfd3', '#ff6470', '#ff2442'] },
    },
    series: [
      {
        name: '活跃度',
        type: 'heatmap',
        data,
        label: { show: false },
        itemStyle: { borderRadius: 3, borderColor: '#fff', borderWidth: 1 },
        emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(255,36,66,0.5)' } },
      },
    ],
  }
})

// ===== 来源分布(玫瑰图) =====
const sourceOption = computed(() => ({
  tooltip: { trigger: 'item', backgroundColor: 'rgba(255,255,255,0.95)' },
  legend: {
    bottom: 0,
    textStyle: { color: '#6b7280', fontSize: 12 },
    itemWidth: 10,
    itemHeight: 10,
  },
  series: [
    {
      type: 'pie',
      radius: [30, 90],
      center: ['50%', '45%'],
      roseType: 'area',
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { color: '#6b7280', fontSize: 11 },
      data: [
        { value: 4321, name: '微信小程序' },
        { value: 3120, name: 'H5 分享' },
        { value: 2080, name: '直接访问' },
        { value: 1685, name: '公众号' },
        { value: 980, name: '其他来源' },
      ].map((d, i) => ({
        ...d,
        itemStyle: { color: ['#ff2442', '#ff6470', '#ff9f43', '#2b6fff', '#c44dff'][i] },
      })),
    },
  ],
}))

// ===== 留存柱状图 =====
const retentionOption = computed(() => ({
  tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)' },
  legend: {
    data: ['新增用户', '次日留存', '7 日留存', '30 日留存'],
    right: 8,
    top: 4,
    itemWidth: 10,
    itemHeight: 10,
    itemGap: 16,
    textStyle: { color: '#6b7280', fontSize: 12 },
  },
  grid: { left: 36, right: 16, top: 44, bottom: 32, containLabel: false },
  xAxis: {
    type: 'category',
    data: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周', '第8周'],
    axisLine: { lineStyle: { color: '#e5e7eb' } },
    axisLabel: { color: '#9ca3af', fontSize: 11 },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
    axisLabel: { color: '#9ca3af', fontSize: 11 },
  },
  barGap: '30%',
  barCategoryGap: '45%',
  series: [
    {
      name: '新增用户',
      type: 'bar',
      data: [1200, 1450, 1320, 1680, 1520, 1840, 2100, 2280],
      barWidth: 12,
      itemStyle: { color: '#cbd5e1', borderRadius: [4, 4, 0, 0] },
    },
    {
      name: '次日留存',
      type: 'bar',
      data: [820, 980, 910, 1180, 1080, 1320, 1500, 1640],
      barWidth: 12,
      itemStyle: { color: '#2b6fff', borderRadius: [4, 4, 0, 0] },
    },
    {
      name: '7 日留存',
      type: 'bar',
      data: [420, 480, 510, 620, 580, 720, 820, 940],
      barWidth: 12,
      itemStyle: { color: '#ff9f43', borderRadius: [4, 4, 0, 0] },
    },
    {
      name: '30 日留存',
      type: 'bar',
      data: [180, 220, 240, 310, 280, 360, 420, 480],
      barWidth: 12,
      itemStyle: { color: '#ff2442', borderRadius: [4, 4, 0, 0] },
    },
  ],
}))

// ===== 顶部数据卡 =====
const topStats = [
  { label: '今日新增用户', value: 287, trend: 12.4, up: true, color: '#ff2442' },
  { label: '日活用户 (DAU)', value: '12,849', trend: 8.6, up: true, color: '#2b6fff' },
  { label: '人均使用时长', value: '18 分 32 秒', trend: 3.2, up: true, color: '#16c099' },
  { label: '次留率', value: '68.4%', trend: 1.2, up: false, color: '#ff9f43' },
]
</script>

<template>
  <div class="analytics-page">
    <!-- ===== 顶部数据卡 ===== -->
    <div class="top-stats">
      <div
        v-for="(s, i) in topStats"
        :key="s.label"
        class="ts-card hover-lift fade-in"
        :style="{ animationDelay: `${i * 60}ms` }"
      >
        <div class="ts-head">
          <span class="ts-label">{{ s.label }}</span>
          <span class="ts-trend" :class="{ up: s.up, down: !s.up }">
            <el-icon size="12">
              <CaretTop v-if="s.up" />
              <CaretBottom v-else />
            </el-icon>
            {{ Math.abs(s.trend) }}%
          </span>
        </div>
        <div class="ts-value num" :style="{ color: s.color }">{{ s.value }}</div>
        <div class="ts-bar">
          <div
            class="ts-bar-fill"
            :style="{
              background: s.color,
              width: (i + 1) * 20 + '%',
            }"
          ></div>
        </div>
      </div>
    </div>

    <!-- ===== 第一行: 内容分类 + 用户漏斗 ===== -->
    <el-row :gutter="20">
      <el-col :xs="24" :lg="12">
        <div class="card chart-card">
          <div class="card-head">
            <div>
              <h3 class="card-title">内容分类分布</h3>
              <p class="card-sub">各分类内容数量占比</p>
            </div>
          </div>
          <div class="chart-area">
            <v-chart :option="pieOption" autoresize />
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="12">
        <div class="card chart-card">
          <div class="card-head">
            <div>
              <h3 class="card-title">用户转化漏斗</h3>
              <p class="card-sub">从注册到 30 日留存的转化</p>
            </div>
          </div>
          <div class="chart-area">
            <v-chart :option="funnelOption" autoresize />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- ===== 第二行: 24h 活跃热力 ===== -->
    <div class="card chart-card">
      <div class="card-head">
        <div>
          <h3 class="card-title">一周活跃时段分布</h3>
          <p class="card-sub">颜色越深表示该时段活跃用户越多</p>
        </div>
        <el-tag type="info" effect="plain" round>高峰: 周五 21:00</el-tag>
      </div>
      <div class="chart-area chart-area-tall">
        <v-chart :option="heatmapOption" autoresize />
      </div>
    </div>

    <!-- ===== 第三行: 来源 + 留存 ===== -->
    <el-row :gutter="20">
      <el-col :xs="24" :lg="10">
        <div class="card chart-card">
          <div class="card-head">
            <div>
              <h3 class="card-title">流量来源</h3>
              <p class="card-sub">各入口带来访问量</p>
            </div>
          </div>
          <div class="chart-area">
            <v-chart :option="sourceOption" autoresize />
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="14">
        <div class="card chart-card">
          <div class="card-head">
            <div>
              <h3 class="card-title">用户留存分析</h3>
              <p class="card-sub">近 8 周新增与留存趋势</p>
            </div>
          </div>
          <div class="chart-area">
            <v-chart :option="retentionOption" autoresize />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.analytics-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// ===== 顶部统计 =====
.top-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  @media (max-width: 1100px) { grid-template-columns: repeat(2, 1fr); }
}

.ts-card {
  background: #fff;
  border-radius: $radius-lg;
  padding: 20px 24px;
  border: 1px solid $border-light;
  box-shadow: $shadow-sm;
}
html.dark .ts-card { background: #0f172a; border-color: #1e293b; }

.ts-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.ts-label {
  font-size: 13px;
  color: $text-secondary;
}

.ts-trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 500;
  padding: 1px 6px;
  border-radius: 6px;
  &.up { color: #16c099; background: $success-soft; }
  &.down { color: #ff4757; background: $danger-soft; }
}

.ts-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.ts-bar {
  height: 4px;
  background: $bg-page;
  border-radius: 999px;
  margin-top: 12px;
  overflow: hidden;
}
html.dark .ts-bar { background: #1e293b; }

.ts-bar-fill {
  height: 100%;
  border-radius: 999px;
  opacity: 0.6;
  transition: width 0.6s ease;
}

// ===== 通用 card =====
.card {
  background: #fff;
  border-radius: $radius-lg;
  padding: 24px;
  border: 1px solid $border-light;
  box-shadow: $shadow-sm;
}
html.dark .card { background: #0f172a; border-color: #1e293b; }

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.card-title { font-size: 16px; font-weight: 600; color: $text-primary; margin: 0; }
html.dark .card-title { color: #e2e8f0; }
.card-sub { font-size: 12px; color: $text-secondary; margin: 4px 0 0; }

.chart-card .chart-area { height: 320px; }
.chart-area-tall { height: 320px; }
</style>
