import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        science: resolve(process.cwd(), 'science/index.html'),
      },
    },
  },
});
