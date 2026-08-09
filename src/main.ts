import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import './styles/variables.css'
import './styles/global.css'
import router from './router'
import App from './App.vue'
import CommonDialog from './components/CommonDialog.vue'
import { validateToken } from './stores/auth'

const app = createApp(App)
app.use(createPinia())
app.use(ElementPlus, { locale: zhCn })
app.component('CommonDialog', CommonDialog)

// 启动时先验证 token 有效性，再安装路由（初始导航）并挂载
validateToken().then(() => {
  app.use(router)
  app.mount('#app')
})
