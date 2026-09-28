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
        scienceResults: 'science/results/index.html',
        topics: 'topics/index.html',
        methodology: 'methodology/index.html',
        dataPolicy: 'data-policy/index.html',
        factCheck: 'fact-check/index.html',
        changelog: 'changelog/index.html',
        worksheet: 'worksheet/index.html',
        acuteEffects: 'acute-effects/index.html',
        memoryBlackouts: 'memory-blackouts/index.html',
        adolescentBrain: 'adolescent-brain/index.html',
        selfControl: 'self-control/index.html',
        alcoholAndSleep: 'alcohol-and-sleep/index.html',
        alcoholAndDriving: 'alcohol-and-driving/index.html',
        rewardAndHabits: 'reward-and-habits/index.html',
        recoveryAndBrain: 'recovery-and-brain/index.html',
      },
    },
  },
});
