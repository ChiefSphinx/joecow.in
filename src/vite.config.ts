import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          posthog: ['posthog-js'],
        },
      },
    },
    reportCompressedSize: true,
  },
  css: {
    devSourcemap: true,
  },
})
