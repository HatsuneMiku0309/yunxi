import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  server: {
    // allowedHosts: ['yunxi-dev.com'],
    proxy: {
      '/api': 'http://192.168.1.5:3000'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/components'),
      '@views': path.resolve(__dirname, './src/views'),
      '@interfaces': path.resolve(__dirname, './src/interfaces'),
    },
  },
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    tailwindcss(),

    // @quasar/plugin-vite options list:
    // https://github.com/quasarframework/quasar/blob/dev/vite-plugin/index.d.ts
    quasar({
      sassVariables: fileURLToPath(
        new URL('./src/quasar-variables.sass', import.meta.url)
      )
    })
  ],
})
