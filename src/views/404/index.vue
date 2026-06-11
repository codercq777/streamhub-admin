<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="not-found">
    <div class="nf-card">
      <div class="nf-code brand-text">404</div>
      <h2>页面走丢了</h2>
      <p>您访问的页面不存在或已被移除。</p>
      <el-button type="primary" @click="router.push('/')">
        <el-icon><Back /></el-icon>回到首页
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-page;
  padding: 20px;
}
.nf-card {
  text-align: center;
  background: #fff;
  border-radius: $radius-xl;
  padding: 60px 80px;
  box-shadow: $shadow-lg;
  h2 { font-size: 24px; color: $text-primary; margin: 16px 0 8px; }
  p { color: $text-secondary; margin: 0 0 24px; }
}
.nf-code {
  font-size: 80px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -2px;
}
</style>
