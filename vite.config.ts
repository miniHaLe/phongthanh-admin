/// <reference types="vitest/config" />
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'happy-dom',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      'api/src/**/*.spec.ts',
      'tests/e2e/**',
    ],
    // Don't fetch iframe/img subresources in tests (e.g. the OSM map embed).
    environmentOptions: {
      happyDOM: { settings: { disableIframePageLoading: true } },
    },
    globals: true,
    setupFiles: ['src/test/setup.ts'],
  },
})
