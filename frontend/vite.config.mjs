// @ts-check
import vue from '@vitejs/plugin-vue'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import vueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import { checker } from 'vite-plugin-checker'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: { alias: { '@': `${__dirname}/src` } },
  css: {
    preprocessorOptions: {
      scss: {
        // カスタムテーマを追加で読み込み
        additionalData: `@use "@/styles/theme/light.scss" as *;`,
      },
    },
  },
  plugins: [
    checker({ vueTsc: true }),
    vueRouter({ dts: 'src/typed-router.d.ts' }),
    vue(),
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: 'sass',
          directives: true,
          version: '2.1.5',
        }),
      ],
      dts: 'src/components.d.ts',
    }),
  ],
})
