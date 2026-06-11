<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import type { LoginForm } from '@/types'

const router = useRouter()
const userStore = useUserStore()

const form = reactive<LoginForm>({
  username: 'admin',
  password: 'admin123',
  remember: true,
})

const formRef = ref()
const loading = ref(false)

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' },
  ],
}

async function handleLogin() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    loading.value = true
    try {
      await userStore.login({ ...form })
      ElMessage.success('登录成功')
      router.push('/')
    } finally {
      loading.value = false
    }
  })
}

function fillDemo(kind: 'admin' | 'operator') {
  form.username = kind
  form.password = 'demo123'
}

onMounted(() => {
  // 自动聚焦
})
</script>

<template>
  <div class="login-page">
    <!-- 装饰气泡 -->
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>

    <div class="login-card">
      <!-- 左侧 banner -->
      <div class="login-banner">
        <div class="banner-inner">
          <div class="banner-brand">
            <div class="brand-logo">
              <span class="logo-glyph">S</span>
            </div>
            <span class="brand-name">StreamHub</span>
          </div>

          <h1 class="banner-title">
            内容审核<br />
            <span class="grad">更高效</span>
          </h1>
          <p class="banner-desc">
            一站式小程序后台管理,精细化运营,数据可视化,<br />
            让每一次决策都有据可依。
          </p>

          <div class="banner-features">
            <div class="feat">
              <el-icon><CircleCheckFilled /></el-icon>
              <span>智能审核工作流</span>
            </div>
            <div class="feat">
              <el-icon><DataAnalysis /></el-icon>
              <span>实时数据看板</span>
            </div>
            <div class="feat">
              <el-icon><Lock /></el-icon>
              <span>安全合规</span>
            </div>
          </div>

          <div class="banner-footer">
            © 2026 StreamHub · v1.0.0
          </div>
        </div>

        <!-- 装饰 -->
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <svg class="wave" viewBox="0 0 600 300" preserveAspectRatio="none">
          <path
            d="M0,160 C150,220 300,100 450,160 C540,195 580,180 600,170 L600,300 L0,300 Z"
            fill="rgba(255,255,255,0.04)"
          />
          <path
            d="M0,200 C150,260 300,140 450,200 C540,235 580,220 600,210 L600,300 L0,300 Z"
            fill="rgba(255,255,255,0.06)"
          />
        </svg>
      </div>

      <!-- 右侧表单 -->
      <div class="login-form-wrap">
        <div class="form-head">
          <h2>欢迎回来 👋</h2>
          <p>使用账号登录 StreamHub Admin Console</p>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          size="large"
          class="login-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="账号"
              :prefix-icon="'User'"
              clearable
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码"
              :prefix-icon="'Lock'"
              show-password
            />
          </el-form-item>

          <div class="form-row">
            <el-checkbox v-model="form.remember">记住密码</el-checkbox>
            <a class="forgot">忘记密码?</a>
          </div>

          <el-button
            type="primary"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>

          <div class="quick-fill">
            <span class="quick-tip">体验账号</span>
            <el-button text size="small" @click="fillDemo('admin')">admin</el-button>
            <el-button text size="small" @click="fillDemo('operator')">operator</el-button>
          </div>
        </el-form>

        <div class="form-bottom">
          <span>登录即代表同意</span>
          <a>《服务协议》</a>
          <span>与</span>
          <a>《隐私政策》</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: $bg-page;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 24px;
}

// 装饰
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  pointer-events: none;
}
.blob-1 {
  width: 400px; height: 400px;
  background: #ff2442;
  top: -100px; left: -100px;
  animation: float 8s ease-in-out infinite;
}
.blob-2 {
  width: 500px; height: 500px;
  background: #c44dff;
  bottom: -200px; right: -150px;
  animation: float 10s ease-in-out infinite reverse;
}
.blob-3 {
  width: 300px; height: 300px;
  background: #2b6fff;
  top: 30%; right: 30%;
  animation: float 12s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -30px) scale(1.1); }
}

.login-card {
  display: flex;
  width: 1000px;
  max-width: 100%;
  min-height: 600px;
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.12);
  position: relative;
  z-index: 1;
}

html.dark .login-card {
  background: #0f172a;
}

// ===== 左侧 banner =====
.login-banner {
  flex: 0 0 480px;
  background: linear-gradient(135deg, #1a0612 0%, #5a0e2a 50%, #2a0a4a 100%);
  color: #fff;
  padding: 48px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.banner-inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.banner-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: $brand-gradient;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(255, 36, 66, 0.4);
  .logo-glyph {
    color: #fff;
    font-size: 20px;
    font-weight: 800;
  }
}

.brand-name {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.banner-title {
  font-size: 38px;
  line-height: 1.2;
  font-weight: 700;
  margin: 64px 0 20px;
  letter-spacing: -1px;
  .grad {
    background: $brand-gradient;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.banner-desc {
  font-size: 14px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.banner-features {
  margin-top: 48px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.feat {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  .el-icon {
    color: #ff6470;
    font-size: 18px;
  }
}

.banner-footer {
  margin-top: auto;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  padding-top: 32px;
}

// 装饰 orb
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  pointer-events: none;
}
.orb-1 {
  width: 220px; height: 220px;
  background: rgba(255, 36, 66, 0.4);
  top: -60px; right: -60px;
}
.orb-2 {
  width: 280px; height: 280px;
  background: rgba(196, 77, 255, 0.3);
  bottom: -80px; left: -80px;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120px;
  z-index: 1;
}

// ===== 右侧表单 =====
.login-form-wrap {
  flex: 1;
  padding: 64px 56px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-head {
  margin-bottom: 36px;
  h2 {
    font-size: 26px;
    font-weight: 700;
    margin: 0 0 8px;
    color: $text-primary;
    letter-spacing: -0.5px;
  }
  p {
    font-size: 14px;
    color: $text-secondary;
    margin: 0;
  }
}

html.dark .form-head h2 {
  color: #e2e8f0;
}

.login-form {
  :deep(.el-input__wrapper) {
    border-radius: 10px;
    padding: 4px 12px;
    background: #f9fafb;
    box-shadow: 0 0 0 1px $border inset;
    transition: all $transition;
    &:hover {
      box-shadow: 0 0 0 1px $primary-light inset;
    }
    &.is-focus {
      box-shadow: 0 0 0 2px $primary inset, 0 4px 12px rgba(255, 36, 66, 0.15);
      background: #fff;
    }
  }
  :deep(.el-input__inner) {
    height: 42px;
    font-size: 14px;
  }
}

html.dark .login-form {
  :deep(.el-input__wrapper) {
    background: #1e293b;
    box-shadow: 0 0 0 1px #334155 inset;
    &:hover {
      box-shadow: 0 0 0 1px $primary-light inset;
    }
    &.is-focus {
      box-shadow: 0 0 0 2px $primary inset;
      background: #0f172a;
    }
  }
}

.form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  font-size: 13px;
  .forgot {
    color: $primary;
    cursor: pointer;
    &:hover { text-decoration: underline; }
  }
}

.login-btn {
  width: 100%;
  height: 46px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 4px;
  border-radius: 10px;
  background: $brand-gradient !important;
  border: none;
  box-shadow: 0 8px 20px rgba(255, 36, 66, 0.3);
  transition: all $transition;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 28px rgba(255, 36, 66, 0.4);
  }
  &:active {
    transform: translateY(0);
  }
}

.quick-fill {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: $text-tertiary;
  .quick-tip {
    margin-right: 4px;
  }
  :deep(.el-button) {
    color: $text-secondary;
    font-size: 12px;
    &:hover { color: $primary; }
  }
}

.form-bottom {
  margin-top: 32px;
  text-align: center;
  font-size: 12px;
  color: $text-tertiary;
  a {
    color: $primary;
    margin: 0 2px;
    cursor: pointer;
  }
}

@media (max-width: 900px) {
  .login-banner { display: none; }
  .login-form-wrap { padding: 48px 32px; }
}
</style>
