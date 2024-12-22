import path from 'path'
import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    }),
    svgr(),
    process.env.NODE_ENV === 'production' && (visualizer() as PluginOption),
  ],
  resolve: {
    alias: [
      { find: /^~/, replacement: '' },
      { find: 'src', replacement: path.resolve(__dirname, './src') },
    ],
  },
  base: './',
  define: {
    'process.env': process.env,
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
    modules: {
      localsConvention: 'dashesOnly',
    },
  },
  server: {
    port: 4150,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@ant-design')) {
              return 'antd-design'
            }
            if (id.includes('antd')) {
              return 'antd'
            }
            if (id.includes('/rc-') || id.includes('/@rc-')) {
              return 'antd-rc'
            }
            if (id.includes('/chart.js/') || id.includes('chartjs-')) {
              return 'chartjs'
            }
            if (id.includes('/mathjs/')) {
              return 'mathjs'
            }
            // if (id.includes('/dexie/')) {
            //   return 'dexie'
            // }
            return 'vendor'
          }
        },
      },
    },
  },
})
