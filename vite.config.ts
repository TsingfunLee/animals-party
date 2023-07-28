import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import loadVersion from 'vite-plugin-package-version';
import {resolve} from 'path'


// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '_c': resolve(__dirname, 'src/components')
    }
  },
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),

    quasar({
      sassVariables: 'src/style/quasar-variables.sass'
    }),

    loadVersion(),
  ],
  server: {
    proxy: {
      '/socket.io': {
        target: 'ws://localhost/socket.io',
        ws: true
      }
    }
  }
})