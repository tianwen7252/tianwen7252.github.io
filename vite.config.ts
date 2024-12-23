import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'

const isProduction = process.env.NODE_ENV === 'production'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    }),
    svgr(),
    isProduction && viteCompression(),
    isProduction && visualizer(),
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
        // experimentalMinChunkSize: 500000, // doesn't work in Vite
        manualChunks: {
          react: ['react', 'react-dom'],
          lodash: ['lodash-es'],
          antd: ['antd'],
          chartjs: ['chart.js'],
          mathjs: ['mathjs'],
        },

        // manualChunks(id) {
        //   if (id.includes('node_modules')) {
        //     if (id.includes('/react/') || id.includes('/react-')) {
        //       return 'react'
        //     }
        //     if (id.includes('antd')) {
        //       return 'antd'
        //     }
        //     // will get - Uncaught TypeError: Cannot read properties of undefined (reading 'createContext')
        //     // if (
        //     //   id.includes('/rc-') ||
        //     //   id.includes('@ant-design') ||
        //     //   id.includes('/@rc-')
        //     // ) {
        //     //   return 'antd-deps'
        //     // }
        //     if (id.includes('/chart.js/') || id.includes('chartjs-')) {
        //       return 'chartjs'
        //     }
        //     if (id.includes('/mathjs/')) {
        //       return 'mathjs'
        //     }
        //     // if (id.includes('/dexie/')) {
        //     //   return 'dexie'
        //     // }
        //     return 'vendor'
        //   }
        // },
      },
    },
  },
})
