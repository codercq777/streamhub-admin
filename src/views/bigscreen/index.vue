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
onMounted(() => {
  calcScale()
  window.addEventListener('resize', calcScale)
  // 启动时间 + 翻牌器
  tick()
  timer = window.setInterval(tick, 1000)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', calcScale)
  if (timer) clearInterval(timer)
})

// ===== 实时时间 =====
const now = ref(new Date())
let timer: number
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

// ===== 数字翻牌器(带动画) =====
const metrics = ref([
  { label: '活跃用户', value: 0, target: 12849, suffix: '', color: '#00f0ff' },
  { label: '今日订单', value: 0, target: 3287, suffix: '', color: '#ff6b6b' },
  { label: '总流水 (元)', value: 0, target: 158420, suffix: '', color: '#16c099' },
  { label: '访问 PV', value: 0, target: 89420, suffix: '', color: '#c44dff' },
])

// 进入动画
onMounted(() => {
  setTimeout(() => {
    metrics.value.forEach((m, i) => {
      const start = performance.now()
      const dur = 1500 + i * 200
      const startVal = 0
      const endVal = m.target
      function step(t: number) {
        const p = Math.min(1, (t - start) / dur)
        const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
        m.value = Math.floor(startVal + (endVal - startVal) * eased)
        if (p < 1) requestAnimationFrame(step)
        else m.value = endVal
      }
      requestAnimationFrame(step)
    })
  }, 300)
})

const formatted = (v: number) => v.toLocaleString('en-US')

// ===== 折线图:实时访问趋势 =====
const lineOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(0,20,40,0.85)',
    borderColor: '#00f0ff',
    textStyle: { color: '#fff' },
  },
  grid: { left: 40, right: 20, top: 30, bottom: 30 },
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
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      data: Array.from({ length: 24 }, (_, i) => 800 + Math.floor(Math.random() * 1200) + i * 30),
      itemStyle: { color: '#00f0ff' },
      lineStyle: { width: 2, color: '#00f0ff' },
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
  tooltip: { trigger: 'item', backgroundColor: 'rgba(0,20,40,0.85)', borderColor: '#00f0ff', textStyle: { color: '#fff' } },
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
      label: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
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
  tooltip: { backgroundColor: 'rgba(0,20,40,0.85)', borderColor: '#00f0ff', textStyle: { color: '#fff' } },
  radar: {
    indicator: [
      { name: '活跃度', max: 100 },
      { name: '付费力', max: 100 },
      { name: '留存', max: 100 },
      { name: '互动', max: 100 },
      { name: '内容产出', max: 100 },
      { name: '分享', max: 100 },
    ],
    axisName: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
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

// ===== 漏斗图:转化漏斗 =====
const funnelOption = computed(() => ({
  tooltip: { trigger: 'item', backgroundColor: 'rgba(0,20,40,0.85)', borderColor: '#00f0ff', textStyle: { color: '#fff' } },
  series: [
    {
      type: 'funnel',
      left: '10%',
      right: '10%',
      top: 20,
      bottom: 20,
      sort: 'descending',
      gap: 4,
      label: { color: '#fff', fontSize: 12, fontWeight: 600 },
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

// ===== 省份排行(替代中国地图,简化) =====
const provinceOption = computed(() => ({
  tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,20,40,0.85)', borderColor: '#00f0ff', textStyle: { color: '#fff' } },
  grid: { left: 70, right: 30, top: 10, bottom: 20 },
  xAxis: {
    type: 'value',
    show: false,
  },
  yAxis: {
    type: 'category',
    data: ['四川', '湖北', '福建', '浙江', '江苏', '广东', '上海', '北京', '浙江', '广东'],
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  },
  series: [
    {
      type: 'bar',
      data: [1820, 1960, 2150, 2380, 2680, 2890, 3120, 3450, 3680, 3920],
      barWidth: 10,
      itemStyle: {
        borderRadius: [0, 5, 5, 0],
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
const rollingData = ref([
  { time: '14:32:18', user: 'user_1024', action: '发布笔记《夏日咖啡》', amount: '' },
  { time: '14:32:05', user: 'user_1089', action: '完成支付', amount: '¥ 128.00' },
  { time: '14:31:42', user: 'user_1042', action: '关注创作者 @夏天的风', amount: '' },
  { time: '14:31:20', user: 'user_1078', action: '购买会员', amount: '¥ 68.00' },
  { time: '14:30:55', user: 'user_1019', action: '发布评论', amount: '' },
  { time: '14:30:32', user: 'user_1102', action: '完成支付', amount: '¥ 256.00' },
  { time: '14:30:18', user: 'user_1063', action: '发布笔记《胶片摄影入门》', amount: '' },
  { time: '14:29:55', user: 'user_1099', action: '打赏创作者', amount: '¥ 20.00' },
  { time: '14:29:32', user: 'user_1056', action: '注册账号', amount: '' },
  { time: '14:29:10', user: 'user_1037', action: '完成支付', amount: '¥ 99.00' },
])

// 模拟实时插入
let rollingTimer: number
onMounted(() => {
  rollingTimer = window.setInterval(() => {
    const newItem = {
      time: timeStr.value,
      user: `user_${1000 + Math.floor(Math.random() * 200)}`,
      action: ['发布笔记', '完成支付', '关注创作者', '购买会员', '发布评论'][Math.floor(Math.random() * 5)] + (Math.random() > 0.5 ? ` #${Math.floor(Math.random() * 100)}` : ''),
      amount: Math.random() > 0.5 ? `¥ ${(Math.random() * 300).toFixed(0)}.00` : '',
    }
    rollingData.value.unshift(newItem)
    if (rollingData.value.length > 12) rollingData.value.pop()
  }, 3000)
})
onBeforeUnmount(() => clearInterval(rollingTimer))

// 返回
function goBack() {
  router.push('/dashboard')
}
</script>

<template>
  <div class="bigscreen-wrapper">
    <div class="bigscreen" :style="{ transform: `scale(${scale})` }">
      <!-- ===== 顶部 ===== -->
      <header class="bs-header">
        <div class="bs-header-left">
          <div class="status-dot"></div>
          <span>SYSTEM ONLINE</span>
        </div>
        <div class="bs-header-center">
          <div class="bs-title-zh">StreamHub 数据驾驶舱</div>
          <div class="bs-title-en">REAL-TIME DATA COCKPIT</div>
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

      <!-- ===== 主体 3 列 ===== -->
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
              <div class="bs-metric-label">{{ m.label }}</div>
              <div class="bs-metric-value num" :style="{ color: m.color }">
                {{ formatted(m.value) }}
              </div>
              <div class="bs-metric-bar">
                <div
                  class="bs-metric-bar-fill"
                  :style="{ background: `linear-gradient(90deg, transparent, ${m.color})` }"
                ></div>
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

      <!-- ===== 底部滚动表格 ===== -->
      <footer class="bs-footer">
        <Panel title="实时事件流" icon="BellFilled" class="bs-rolling">
          <div class="bs-rolling-list">
            <transition-group name="roll" tag="div">
              <div v-for="(r, i) in rollingData" :key="r.time + r.user + i" class="bs-rolling-item">
                <span class="r-time num">{{ r.time }}</span>
                <span class="r-user">{{ r.user }}</span>
                <span class="r-action">{{ r.action }}</span>
                <span class="r-amount" v-if="r.amount">{{ r.amount }}</span>
                <span class="r-dot"></span>
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
    </div>
  </div>
</template>

<script lang="ts">
// Panel 组件(简单包装,避免大块重复)
import { defineComponent, h } from 'vue'
export const Panel = defineComponent({
  name: 'Panel',
  props: { title: { type: String, required: true }, icon: { type: String, default: '' } },
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'bs-panel' }, [
        h('div', { class: 'bs-panel-head' }, [
          props.icon
            ? h('span', { class: 'bs-panel-icon' }, [
                h('i', { class: 'el-icon' }, [
                  h('el-icon', null, () => h('component', { is: props.icon })),
                ]),
              ])
            : null,
          h('span', { class: 'bs-panel-title' }, props.title),
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
    radial-gradient(ellipse at top, rgba(0, 240, 255, 0.08), transparent 50%),
    radial-gradient(ellipse at bottom, rgba(196, 77, 255, 0.05), transparent 50%),
    linear-gradient(180deg, #050b18 0%, #0a1a2e 50%, #050b18 100%);
  display: grid;
  grid-template-rows: 80px 1fr 200px;
  gap: 16px;
  padding: 16px 24px;
  overflow: hidden;
  color: #fff;
}

// ===== 头部 =====
.bs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.bs-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #00f0ff;
  font-size: 13px;
  letter-spacing: 1px;
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

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
}

.bs-header-center {
  text-align: center;
  position: relative;
  flex: 1;
}

.bs-title-zh {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 6px;
  background: linear-gradient(180deg, #fff 0%, #00f0ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(0, 240, 255, 0.5);
}

.bs-title-en {
  font-size: 11px;
  letter-spacing: 4px;
  color: rgba(0, 240, 255, 0.6);
  margin-top: 4px;
  font-weight: 500;
}

.bs-header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.bs-time {
  text-align: right;
}

.bs-time-hms {
  font-size: 24px;
  font-weight: 700;
  color: #00f0ff;
  line-height: 1;
  letter-spacing: 1px;
  text-shadow: 0 0 20px rgba(0, 240, 255, 0.6);
}

.bs-time-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}

.bs-back {
  color: rgba(255, 255, 255, 0.7) !important;
  &:hover { color: #00f0ff !important; }
}

// ===== 主体 3 列 =====
.bs-main {
  display: grid;
  grid-template-columns: 1fr 1.3fr 1fr;
  gap: 16px;
}

.bs-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.bs-col-center {
  display: grid;
  grid-template-rows: 200px 1fr;
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
  padding: 12px 16px 8px;
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 12px;
    height: 12px;
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
  font-size: 14px;
  font-weight: 600;
  color: #00f0ff;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  letter-spacing: 1px;
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
  padding: 16px;
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.04), rgba(196, 77, 255, 0.02));
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 4px;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: -1px; left: -1px;
    width: 12px; height: 12px;
    border: 2px solid #00f0ff;
    border-right: none; border-bottom: none;
  }
  &::after {
    content: '';
    position: absolute;
    bottom: -1px; right: -1px;
    width: 12px; height: 12px;
    border: 2px solid #00f0ff;
    border-left: none; border-top: none;
  }
}

.bs-metric {
  text-align: center;
  position: relative;
  padding: 8px 4px;
  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 25%;
    bottom: 25%;
    width: 1px;
    background: linear-gradient(180deg, transparent, rgba(0, 240, 255, 0.2), transparent);
  }
  &:last-child::after { display: none; }
}

.bs-metric-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 6px;
  letter-spacing: 1px;
}

.bs-metric-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
  text-shadow: 0 0 16px currentColor;
  letter-spacing: -0.5px;
}

.bs-metric-bar {
  height: 2px;
  background: rgba(0, 240, 255, 0.1);
  margin-top: 8px;
  overflow: hidden;
}

.bs-metric-bar-fill {
  height: 100%;
  width: 100%;
  animation: barSlide 2s ease-out;
}

@keyframes barSlide {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

// ===== 底部滚动 =====
.bs-footer {
  min-height: 0;
}

:deep(.bs-rolling) {
  height: 100%;
}

.bs-rolling-list {
  height: 100%;
  overflow: hidden;
  position: relative;
}

.bs-rolling-item {
  display: grid;
  grid-template-columns: 90px 110px 1fr 110px 4px;
  align-items: center;
  gap: 12px;
  padding: 5px 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  border-bottom: 1px dashed rgba(0, 240, 255, 0.06);
}

.r-time { color: #00f0ff; font-weight: 600; }
.r-user { color: rgba(196, 77, 255, 0.9); }
.r-action { color: rgba(255, 255, 255, 0.85); }
.r-amount { color: #16c099; font-weight: 600; text-align: right; }
.r-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #00f0ff;
  box-shadow: 0 0 6px #00f0ff;
}

.roll-enter-active,
.roll-leave-active {
  transition: all 0.4s ease;
}
.roll-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}
.roll-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

// ===== 角标 =====
.bs-corner {
  position: absolute;
  width: 24px;
  height: 24px;
  border: 2px solid #00f0ff;
  pointer-events: none;
  &-tl { top: 0; left: 0; border-right: none; border-bottom: none; }
  &-tr { top: 0; right: 0; border-left: none; border-bottom: none; }
  &-bl { bottom: 0; left: 0; border-right: none; border-top: none; }
  &-br { bottom: 0; right: 0; border-left: none; border-top: none; }
}
</style>
