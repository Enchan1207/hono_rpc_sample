import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { createApp } from 'vue'
import { router } from './routes'
import App from '@/App.vue'

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
