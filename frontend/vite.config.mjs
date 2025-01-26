import vue from '@vitejs/plugin-vue'
import vueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vueRouter(),
    vue(),
  ],
  resolve: { alias: { '@': `${__dirname}/src` } },
})
