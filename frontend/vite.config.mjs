import vue from '@vitejs/plugin-vue'
import vueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import { checker } from 'vite-plugin-checker'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    checker({ vueTsc: true }),
    vueRouter(),
    vue(),
  ],
  resolve: { alias: { '@': `${__dirname}/src` } },
})
