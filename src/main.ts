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

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })
app.component('CommonDialog', CommonDialog)
app.mount('#app')
