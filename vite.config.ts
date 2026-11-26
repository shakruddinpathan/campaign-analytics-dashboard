import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // "@/components/ui/button" instead of "../../components/ui/button"
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  build: {
    rollupOptions: {
      output: {
        // Keep Highcharts in its own chunk: it is the heaviest dependency and
        // rarely changes, so browsers can cache it between deployments.
        manualChunks: (id: string) => (id.includes('node_modules/highcharts') ? 'highcharts' : undefined),
      },
    },
  },
});
