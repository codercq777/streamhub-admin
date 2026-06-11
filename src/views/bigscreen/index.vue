<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import VChart from 'vue-echarts'
import { useRouter } from 'vue-router'

const router = useRouter()

// ===== 缩放适配:基于 1920×1080 设计稿 =====
const baseWidth = 1920
const baseHeight = 1080
const scale = ref(1)

function calcScale() {
  const w = window.innerWidth
  const h = window.innerHeight
  scale.value = Math.min(w / baseWidth, h / baseHeight)
}

// ===== 实时时间 =====
const now = ref(new Date())
let timer1: number
let timer2: number
let timer3: number

function tick() {
  now.value = new Date()
}
const timeStr = computed(() => {
  const d = now.value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
})
const dateStr = computed(() => {
  const d = now.value
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${weeks[d.getDay()]}`
})

// ===== 数字翻牌器(进入动画 + 实时微涨) =====
interface Metric {
  label: string
  value: number
  base: number
  unit: string
  color: string
  spark: number[] // 最近 12 个点
  trend: number
}

const metrics = ref<Metric[]>([
  { label: '活跃用户', value: 0, base: 12849, unit: '', color: '#00f0ff', spark: [], trend: 0 },
  { label: '今日订单', value: 0, base: 3287, unit: '', color: '#ff6b6b', spark: [], trend: 0 },
  { label: '总流水', value: 0, base: 158420, unit: '¥', color: '#16c099', spark: [], trend: 0 },
  { label: '访问 PV', value: 0, base: 89420, unit: '', color: '#c44dff', spark: [], trend: 0 },
])

// 进入动画:0 → base,逐个 delay
function animateIn() {
  metrics.value.forEach((m, i) => {
    const start = performance.now()
    const dur = 1600 + i * 200
    function step(t: number) {
      const p = Math.min(1, (t - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
      m.value = Math.floor(m.base * eased)
      if (p < 1) requestAnimationFrame(step)
      else m.value = m.base
    }
    setTimeout(() => requestAnimationFrame(step), 300 + i * 150)
  })
}

// 实时微涨:每 2.5s 在 base ±3% 范围内波动,推入 spark
function pulseMetric(m: Metric) {
  const delta = (Math.random() - 0.5) * 0.06 // ±3%
  const next = Math.max(1, Math.floor(m.base * (1 + delta)))
  // 数字 tween 200ms
  const from = m.value
  const start = performance.now()
  function step(t: number) {
    const p = Math.min(1, (t - start) / 200)
    m.value = Math.floor(from + (next - from) * p)
    if (p < 1) requestAnimationFrame(step)
    else m.value = next
  }
  requestAnimationFrame(step)
  // spark 推一个
  m.spark.push(next)
  if (m.spark.length > 14) m.spark.shift()
  // 趋势 = (最新 - 7 个点前) / 7 个点前
  if (m.spark.length >= 8) {
    const old = m.spark[m.spark.length - 8]
    m.trend = ((next - old) / old) * 100
  }
}

const formatted = (v: number) => v.toLocaleString('en-US')

// ===== 折线图:实时访问趋势 =====
const lineOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(0,20,40,0.9)',
    borderColor: '#00f0ff',
    textStyle: { color: '#fff' },
  },
  grid: { left: 40, right: 16, top: 36, bottom: 28 },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    axisLine: { lineStyle: { color: 'rgba(0,240,255,0.3)' } },
    axisLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: 'rgba(0,240,255,0.1)' } },
    axisLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  },
  series: [
    {
      name: '访问量',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      data: Array.from({ length: 24 }, (_, i) => 800 + Math.floor(Math.random() * 1200) + i * 30),
      itemStyle: { color: '#00f0ff' },
      lineStyle: { width: 2.5, color: '#00f0ff' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(0,240,255,0.5)' },
            { offset: 1, color: 'rgba(0,240,255,0)' },
          ],
        },
      },
    },
  ],
}))

// ===== 饼图:用户来源 =====
const pieOption = computed(() => ({
  tooltip: { trigger: 'item', backgroundColor: 'rgba(0,20,40,0.9)', borderColor: '#00f0ff', textStyle: { color: '#fff' } },
  legend: {
    bottom: 0,
    textStyle: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
    itemWidth: 10,
    itemHeight: 10,
  },
  series: [
    {
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      itemStyle: { borderColor: '#0a1a2e', borderWidth: 2 },
      label: { color: 'rgba(255,255,255,0.85)', fontSize: 11, formatter: '{b}\n{d}%' },
      data: [
        { value: 4321, name: '微信小程序', itemStyle: { color: '#00f0ff' } },
        { value: 3120, name: 'H5 分享', itemStyle: { color: '#ff6b6b' } },
        { value: 2080, name: '直接访问', itemStyle: { color: '#16c099' } },
        { value: 1685, name: '公众号', itemStyle: { color: '#c44dff' } },
        { value: 980, name: '其他', itemStyle: { color: '#ff9f43' } },
      ],
    },
  ],
}))

// ===== 雷达图:用户画像 =====
const radarOption = computed(() => ({
  tooltip: { backgroundColor: 'rgba(0,20,40,0.9)', borderColor: '#00f0ff', textStyle: { color: '#fff' } },
  radar: {
    indicator: [
      { name: '活跃度', max: 100 },
      { name: '付费力', max: 100 },
      { name: '留存', max: 100 },
      { name: '互动', max: 100 },
      { name: '内容产出', max: 100 },
      { name: '分享', max: 100 },
    ],
    axisName: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
    splitLine: { lineStyle: { color: 'rgba(0,240,255,0.2)' } },
    splitArea: { areaStyle: { color: ['rgba(0,240,255,0.02)', 'rgba(0,240,255,0.05)'] } },
    axisLine: { lineStyle: { color: 'rgba(0,240,255,0.2)' } },
  },
  series: [
    {
      type: 'radar',
      data: [
        {
          value: [85, 70, 78, 88, 65, 72],
          name: '本月',
          areaStyle: { color: 'rgba(0,240,255,0.3)' },
          lineStyle: { color: '#00f0ff', width: 2 },
          itemStyle: { color: '#00f0ff' },
        },
        {
          value: [70, 60, 65, 75, 55, 60],
          name: '上月',
          areaStyle: { color: 'rgba(196,77,255,0.2)' },
          lineStyle: { color: '#c44dff', width: 2 },
          itemStyle: { color: '#c44dff' },
        },
      ],
    },
  ],
}))

// ===== 漏斗图:转化漏斗(右侧 label,完整显示) =====
const funnelOption = computed(() => ({
  tooltip: { trigger: 'item', backgroundColor: 'rgba(0,20,40,0.9)', borderColor: '#00f0ff', textStyle: { color: '#fff' } },
  series: [
    {
      type: 'funnel',
      left: '5%',
      right: '25%',
      top: 10,
      bottom: 10,
      width: '70%',
      minSize: '15%',
      maxSize: '100%',
      sort: 'descending',
      gap: 4,
      label: {
        position: 'right',
        color: '#fff',
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 16,
        formatter: (p: any) => `${p.name}\n${p.value}%`,
      },
      labelLine: {
        show: true,
        length: 10,
        lineStyle: { color: 'rgba(0,240,255,0.4)', width: 1 },
      },
      itemStyle: { borderColor: '#0a1a2e', borderWidth: 2 },
      data: [
        { value: 100, name: '浏览 12,849', itemStyle: { color: '#00f0ff' } },
        { value: 78, name: '点击 9,872', itemStyle: { color: '#06b6d4' } },
        { value: 52, name: '下单 6,584', itemStyle: { color: '#16c099' } },
        { value: 32, name: '支付 4,128', itemStyle: { color: '#ff9f43' } },
        { value: 18, name: '复购 2,313', itemStyle: { color: '#ff6b6b' } },
      ],
    },
  ],
}))

// ===== 省份排行 TOP 10 =====
const provinceOption = computed(() => ({
  tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,20,40,0.9)', borderColor: '#00f0ff', textStyle: { color: '#fff' } },
  grid: { left: 70, right: 40, top: 10, bottom: 20 },
  xAxis: { type: 'value', show: false },
  yAxis: {
    type: 'category',
    data: ['四川', '湖北', '福建', '浙江', '江苏', '广东', '上海', '北京', '广东', '北京'],
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  },
  series: [
    {
      type: 'bar',
      data: [1820, 1960, 2150, 2380, 2680, 2890, 3120, 3450, 3680, 3920],
      barWidth: 9,
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: 'rgba(0,240,255,0.2)' },
            { offset: 1, color: '#00f0ff' },
          ],
        },
      },
      label: {
        show: true,
        position: 'right',
        color: '#00f0ff',
        fontSize: 11,
        fontWeight: 600,
      },
    },
  ],
}))

// ===== 实时滚动数据 =====
interface RollItem { time: string; user: string; action: string; amount: string; tag: 'pay' | 'view' | 'follow' }

const rollingData = ref<RollItem[]>(
  Array.from({ length: 10 }, (_, i) => ({
    time: `14:3${i}:00`,
    user: `user_${1000 + i * 7}`,
    action: ['发布笔记', '完成支付', '关注创作者', '购买会员', '发布评论'][i % 5],
    amount: i % 2 === 0 ? `¥ ${(20 + i * 18).toFixed(0)}.00` : '',
    tag: i % 3 === 0 ? 'pay' : i % 3 === 1 ? 'view' : 'follow',
  }))
)

// 模拟实时插入
function pushNew() {
  const newItem: RollItem = {
    time: timeStr.value,
    user: `user_${1000 + Math.floor(Math.random() * 200)}`,
    action: ['发布笔记', '完成支付', '关注创作者', '购买会员', '发布评论'][Math.floor(Math.random() * 5)] + (Math.random() > 0.5 ? ` #${Math.floor(Math.random() * 100)}` : ''),
    amount: Math.random() > 0.5 ? `¥ ${(20 + Math.random() * 280).toFixed(0)}.00` : '',
    tag: Math.random() > 0.5 ? 'pay' : Math.random() > 0.5 ? 'view' : 'follow',
  }
  rollingData.value.unshift(newItem)
  if (rollingData.value.length > 14) rollingData.value.pop()
}

const tagColor: Record<RollItem['tag'], string> = {
  pay: '#16c099',
  view: '#00f0ff',
  follow: '#c44dff',
}
const tagLabel: Record<RollItem['tag'], string> = {
  pay: '交易',
  view: '浏览',
  follow: '关注',
}

// 生命周期
onMounted(() => {
  calcScale()
  window.addEventListener('resize', calcScale)
  animateIn()
  timer1 = window.setInterval(tick, 1000)
  timer2 = window.setInterval(() => metrics.value.forEach(pulseMetric), 2500)
  timer3 = window.setInterval(pushNew, 2800)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', calcScale)
  clearInterval(timer1)
  clearInterval(timer2)
  clearInterval(timer3)
})

// 返回
function goBack() {
  router.push('/dashboard')
}
</script>

<template>
  <div class="bigscreen-wrapper">
    <div class="bigscreen" :style="{ transform: `scale(${scale})` }">
      <!-- 顶部 -->
      <header class="bs-header">
        <div class="bs-header-left">
          <div class="status-dot"></div>
          <span>SYSTEM ONLINE</span>
          <div class="header-sep"></div>
          <span class="header-meta">NODE: SH-01</span>
        </div>

        <div class="bs-header-center">
          <div class="bs-title-deco left"></div>
          <div class="bs-title-block">
            <div class="bs-title-zh">StreamHub 数据驾驶舱</div>
            <div class="bs-title-en">REAL-TIME DATA COCKPIT</div>
          </div>
          <div class="bs-title-deco right"></div>
        </div>

        <div class="bs-header-right">
          <div class="bs-time">
            <div class="bs-time-hms num">{{ timeStr }}</div>
            <div class="bs-time-date">{{ dateStr }}</div>
          </div>
          <el-button text class="bs-back" @click="goBack">
            <el-icon><Back /></el-icon>返回
          </el-button>
        </div>
      </header>

      <!-- 主体 3 列 -->
      <main class="bs-main">
        <!-- 左列 -->
        <section class="bs-col">
          <Panel title="实时访问趋势" icon="TrendCharts">
            <v-chart :option="lineOption" autoresize class="bs-chart" />
          </Panel>
          <Panel title="省份访问 TOP 10" icon="Location">
            <v-chart :option="provinceOption" autoresize class="bs-chart" />
          </Panel>
        </section>

        <!-- 中列 -->
        <section class="bs-col bs-col-center">
          <!-- 4 翻牌器 -->
          <div class="bs-metrics">
            <div
              v-for="m in metrics"
              :key="m.label"
              class="bs-metric"
              :style="{ '--mc': m.color }"
            >
              <!-- 装饰环 -->
              <svg class="bs-metric-ring" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" stroke-width="1" opacity="0.15" />
                <circle
                  cx="50" cy="50" r="44"
                  fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round"
                  stroke-dasharray="276"
                  stroke-dashoffset="80"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div class="bs-metric-label">{{ m.label }}</div>
              <div class="bs-metric-value-row">
                <span v-if="m.unit" class="bs-metric-unit" :style="{ color: m.color }">{{ m.unit }}</span>
                <span class="bs-metric-value num" :style="{ color: m.color }">{{ formatted(m.value) }}</span>
              </div>
              <div class="bs-metric-trend" :class="m.trend >= 0 ? 'up' : 'down'">
                <el-icon size="11">
                  <CaretTop v-if="m.trend >= 0" />
                  <CaretBottom v-else />
                </el-icon>
                <span>{{ Math.abs(m.trend).toFixed(1) }}%</span>
                <span class="bs-metric-trend-label">实时</span>
              </div>
            </div>
          </div>
          <Panel title="用户转化漏斗" icon="Filter">
            <v-chart :option="funnelOption" autoresize class="bs-chart" />
          </Panel>
        </section>

        <!-- 右列 -->
        <section class="bs-col">
          <Panel title="用户来源构成" icon="PieChart">
            <v-chart :option="pieOption" autoresize class="bs-chart" />
          </Panel>
          <Panel title="用户画像对比" icon="DataAnalysis">
            <v-chart :option="radarOption" autoresize class="bs-chart" />
          </Panel>
        </section>
      </main>

      <!-- 底部滚动表格 -->
      <footer class="bs-footer">
        <Panel title="实时事件流" icon="BellFilled" class="bs-rolling">
          <div class="bs-rolling-list">
            <transition-group name="roll" tag="div">
              <div v-for="(r, i) in rollingData" :key="r.time + r.user + i" class="bs-rolling-item">
                <span class="r-time num">{{ r.time }}</span>
                <span
                  class="r-tag"
                  :style="{ color: tagColor[r.tag], background: tagColor[r.tag] + '20' }"
                >{{ tagLabel[r.tag] }}</span>
                <span class="r-user">{{ r.user }}</span>
                <span class="r-action">{{ r.action }}</span>
                <span class="r-amount" v-if="r.amount">{{ r.amount }}</span>
                <span class="r-dot" :style="{ background: tagColor[r.tag] }"></span>
              </div>
            </transition-group>
          </div>
        </Panel>
      </footer>

      <!-- 角标装饰 -->
      <div class="bs-corner bs-corner-tl"></div>
      <div class="bs-corner bs-corner-tr"></div>
      <div class="bs-corner bs-corner-bl"></div>
      <div class="bs-corner bs-corner-br"></div>

      <!-- 扫描线 -->
      <div class="bs-scan-line"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, h } from 'vue'
export const Panel = defineComponent({
  name: 'Panel',
  props: { title: { type: String, required: true }, icon: { type: String, default: '' } },
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'bs-panel' }, [
        h('div', { class: 'bs-panel-head' }, [
          h('div', { class: 'bs-panel-icon' }, [
            h('i', { class: 'el-icon' }, [
              h('el-icon', null, () => h('component', { is: props.icon })),
            ]),
          ]),
          h('span', { class: 'bs-panel-title' }, props.title),
          h('div', { class: 'bs-panel-head-line' }),
        ]),
        h('div', { class: 'bs-panel-body' }, slots.default?.()),
      ])
  },
})
export default { components: { Panel } }
</script>

<style lang="scss" scoped>
.bigscreen-wrapper {
  width: 100vw;
  height: 100vh;
  background: #050b18;
  overflow: hidden;
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bigscreen {
  width: 1920px;
  height: 1080px;
  transform-origin: center center;
  position: relative;
  background:
    radial-gradient(ellipse at top, rgba(0, 240, 255, 0.1), transparent 50%),
    radial-gradient(ellipse at bottom, rgba(196, 77, 255, 0.06), transparent 50%),
    linear-gradient(180deg, #050b18 0%, #0a1a2e 50%, #050b18 100%);
  display: grid;
  grid-template-rows: 100px 1fr 240px;
  gap: 16px;
  padding: 20px 28px;
  overflow: hidden;
  color: #fff;
}

// ===== 扫描线 =====
.bs-scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00f0ff, transparent);
  opacity: 0.4;
  animation: scanMove 6s linear infinite;
  pointer-events: none;
  z-index: 5;
}

@keyframes scanMove {
  0% { top: 0; opacity: 0; }
  10% { opacity: 0.4; }
  90% { opacity: 0.4; }
  100% { top: 100%; opacity: 0; }
}

// ===== 头部 =====
.bs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.bs-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #00f0ff;
  font-size: 13px;
  letter-spacing: 1.5px;
  font-weight: 500;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #00f0ff;
  box-shadow: 0 0 12px #00f0ff;
  animation: pulse 1.5s ease-in-out infinite;
}

.header-sep {
  width: 1px;
  height: 14px;
  background: rgba(0, 240, 255, 0.3);
  margin: 0 4px;
}

.header-meta {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  letter-spacing: 1px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
}

.bs-header-center {
  display: flex;
  align-items: center;
  gap: 16px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.bs-title-deco {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00f0ff);
  &.right {
    background: linear-gradient(90deg, #00f0ff, transparent);
  }
}

.bs-title-block { text-align: center; }

.bs-title-zh {
  font-size: 34px;
  font-weight: 800;
  letter-spacing: 8px;
  background: linear-gradient(180deg, #fff 0%, #00f0ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(0, 240, 255, 0.5);
  line-height: 1;
}

.bs-title-en {
  font-size: 11px;
  letter-spacing: 5px;
  color: rgba(0, 240, 255, 0.6);
  margin-top: 6px;
  font-weight: 500;
}

.bs-header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.bs-time {
  text-align: right;
  padding-right: 16px;
  border-right: 1px solid rgba(0, 240, 255, 0.2);
}

.bs-time-hms {
  font-size: 26px;
  font-weight: 700;
  color: #00f0ff;
  line-height: 1;
  letter-spacing: 1.5px;
  text-shadow: 0 0 20px rgba(0, 240, 255, 0.6);
}

.bs-time-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  margin-top: 6px;
  letter-spacing: 0.5px;
}

.bs-back {
  color: rgba(255, 255, 255, 0.7) !important;
  border: 1px solid rgba(0, 240, 255, 0.3) !important;
  border-radius: 6px !important;
  &:hover { color: #00f0ff !important; border-color: #00f0ff !important; }
}

// ===== 主体 3 列 =====
.bs-main {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  gap: 16px;
  min-height: 0;
}

.bs-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.bs-col-center {
  display: grid;
  grid-template-rows: 220px 1fr;
  gap: 16px;
}

// ===== Panel 通用 =====
:deep(.bs-panel) {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.04), rgba(196, 77, 255, 0.02));
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 4px;
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 14px 18px 10px;
  overflow: hidden;
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 14px;
    height: 14px;
    border: 2px solid #00f0ff;
  }
  &::before {
    top: -1px;
    left: -1px;
    border-right: none;
    border-bottom: none;
  }
  &::after {
    bottom: -1px;
    right: -1px;
    border-left: none;
    border-top: none;
  }
}

:deep(.bs-panel-head) {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #00f0ff;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  letter-spacing: 1.5px;
  position: relative;
}

:deep(.bs-panel-head-line) {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(0, 240, 255, 0.4), transparent);
  margin-left: 4px;
}

:deep(.bs-panel-icon) {
  display: flex;
  align-items: center;
  color: #00f0ff;
  filter: drop-shadow(0 0 6px rgba(0, 240, 255, 0.6));
  :deep(.el-icon) { font-size: 16px; }
}

:deep(.bs-panel-body) {
  flex: 1;
  min-height: 0;
  position: relative;
}

.bs-chart {
  width: 100%;
  height: 100%;
}

// ===== 4 翻牌器 =====
.bs-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 18px 20px;
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.04), rgba(196, 77, 255, 0.02));
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 4px;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: -1px; left: -1px;
    width: 14px; height: 14px;
    border: 2px solid #00f0ff;
    border-right: none; border-bottom: none;
  }
  &::after {
    content: '';
    position: absolute;
    bottom: -1px; right: -1px;
    width: 14px; height: 14px;
    border: 2px solid #00f0ff;
    border-left: none; border-top: none;
  }
}

.bs-metric {
  text-align: center;
  position: relative;
  padding: 4px 4px 2px;
  color: var(--mc);
  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 20%;
    bottom: 20%;
    width: 1px;
    background: linear-gradient(180deg, transparent, currentColor, transparent);
    opacity: 0.25;
  }
  &:last-child::after { display: none; }
}

.bs-metric-ring {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 36px;
  height: 36px;
  color: var(--mc);
  opacity: 0.5;
  animation: ringRotate 12s linear infinite;
}

@keyframes ringRotate {
  to { transform: rotate(360deg); }
}

.bs-metric-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 6px;
  letter-spacing: 1.5px;
  text-align: left;
  padding-left: 4px;
}

.bs-metric-value-row {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  line-height: 1;
}

.bs-metric-unit {
  font-size: 14px;
  font-weight: 600;
  opacity: 0.7;
}

.bs-metric-value {
  font-size: 36px;
  font-weight: 800;
  line-height: 1.1;
  text-shadow: 0 0 16px currentColor;
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
}

.bs-metric-trend {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
  &.up { color: #16c099; background: rgba(22, 192, 153, 0.12); }
  &.down { color: #ff4757; background: rgba(255, 71, 87, 0.12); }
  .bs-metric-trend-label { color: rgba(255, 255, 255, 0.4); margin-left: 2px; }
}

// ===== 底部滚动 =====
.bs-footer { min-height: 0; }
:deep(.bs-rolling) { height: 100%; }

.bs-rolling-list {
  height: 100%;
  overflow: hidden;
  position: relative;
}

.bs-rolling-item {
  display: grid;
  grid-template-columns: 90px 60px 100px 1fr 100px 4px;
  align-items: center;
  gap: 14px;
  padding: 6px 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  border-bottom: 1px dashed rgba(0, 240, 255, 0.08);
  &:last-child { border-bottom: none; }
}

.r-time { color: #00f0ff; font-weight: 600; }

.r-tag {
  display: inline-block;
  text-align: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.r-user { color: rgba(196, 77, 255, 0.95); }
.r-action { color: rgba(255, 255, 255, 0.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.r-amount { color: #16c099; font-weight: 600; text-align: right; font-variant-numeric: tabular-nums; }
.r-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  box-shadow: 0 0 8px currentColor;
}

.roll-enter-active,
.roll-leave-active {
  transition: all 0.4s ease;
}
.roll-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.roll-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

// ===== 角标 =====
.bs-corner {
  position: absolute;
  width: 28px;
  height: 28px;
  border: 2px solid #00f0ff;
  pointer-events: none;
  z-index: 4;
  &-tl { top: 6px; left: 6px; border-right: none; border-bottom: none; }
  &-tr { top: 6px; right: 6px; border-left: none; border-bottom: none; }
  &-bl { bottom: 6px; left: 6px; border-right: none; border-top: none; }
  &-br { bottom: 6px; right: 6px; border-left: none; border-top: none; }
}
</style>
