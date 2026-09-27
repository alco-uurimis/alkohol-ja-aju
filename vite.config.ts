import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        science: 'science/index.html',
        acuteEffects: 'acute-effects/index.html',
        memoryBlackouts: 'memory-blackouts/index.html',
        adolescentBrain: 'adolescent-brain/index.html',
        selfControl: 'self-control/index.html',
        alcoholAndSleep: 'alcohol-and-sleep/index.html',
        alcoholAndDriving: 'alcohol-and-driving/index.html',
      },
    },
  },
});

