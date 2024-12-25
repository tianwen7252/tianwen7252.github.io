/// <reference types="vitest" />
import path from 'path'
import { configDefaults, defineConfig, type UserConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    }),
    svgr(),
    tsconfigPaths(),
  ],
  test: {
    include: ['**/*.test.tsx'],
    exclude: [...configDefaults.exclude, '**/node_modules/**', 'packages/*'],
    globals: true,
    css: true,
    setupFiles: ['./src/test/setup.ts'],
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportOnFailure: true,
    },
    testTimeout: 20000,
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      public: path.resolve(__dirname, './public'),
    },
  },
}) as UserConfig
