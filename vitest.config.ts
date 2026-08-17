import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Match the zod/v4/core rewrite used by the main vite config so test
      // imports resolve the same way the app build does.
      'zod/v4/core': path.resolve(__dirname, 'node_modules', 'zod', 'v4', 'core'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
