import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3005,
    open: false
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/lucide')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules/canvas-confetti')) {
            return 'vendor-confetti';
          }
          if (id.includes('/data/presets/')) {
            return 'presets-catalog';
          }
          if (id.includes('/components/templateStudio')) {
            return 'template-studio';
          }
        }
      }
    }
  }
});
