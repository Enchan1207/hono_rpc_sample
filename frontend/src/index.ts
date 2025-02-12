import ElementPlus from 'element-plus'
import '@/styles/index.scss'
import { createApp } from 'vue'
import { router } from './routes'
import App from '@/App.vue'

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
