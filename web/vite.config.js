import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://api:4000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://api:4000',
        changeOrigin: true,
      },
    },
  },
  test: { environment: 'node', include: ['tests/**/*.test.js'] },
});
