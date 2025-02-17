import { createApp } from 'vue'
import { DataLoaderPlugin } from 'unplugin-vue-router/data-loaders'
import { router } from './routes'
import App from '@/App.vue'

import '@/styles/index.scss'
import 'element-plus/theme-chalk/src/message-box.scss'
import 'element-plus/theme-chalk/src/message.scss'

const app = createApp(App)
app.use(DataLoaderPlugin, { router })
app.use(router)
app.mount('#app')
