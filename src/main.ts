import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import * as ElIcons from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
// 全量引入 element-plus 样式(CSS 变量驱动,响应主题切换)
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './utils/echarts'
import './styles/index.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })

// 全量注册 Element Plus 图标(避免每个文件单独 import)
for (const [name, comp] of Object.entries(ElIcons)) {
  app.component(name, comp)
}

app.mount('#app')
