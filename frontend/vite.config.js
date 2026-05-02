import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  cacheDir: '.vite',
  plugins: [react(), tailwindcss()],
  build: {
    emptyOutDir: false,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/images': 'http://localhost:3000',
      '/images_2': 'http://localhost:3000',
    },
  },
});
