import '@/styles/index.scss'
import 'element-plus/theme-chalk/src/message-box.scss'
import 'element-plus/theme-chalk/src/message.scss'

import { createApp } from 'vue'

import App from '@/App.vue'

import { router } from './routes'

const app = createApp(App)
app.use(router)
app.mount('#app')
