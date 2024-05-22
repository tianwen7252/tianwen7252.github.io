/// <reference types="vitest" />
import { configDefaults, defineConfig, type UserConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ['**/*.test.tsx'],
    exclude: [...configDefaults.exclude, '**/node_modules/**', 'packages/*'],
    globals: true,
    css: true,
    setupFiles: ['./config/vitest.setup.tsx'],
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
