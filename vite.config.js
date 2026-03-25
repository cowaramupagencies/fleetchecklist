import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    // Subpath deploys (e.g. GitHub Pages): set VITE_BASE=/your-repo/ in .env.production
    base: env.VITE_BASE || '/',
    server: {
      host: true,
    },
    preview: {
      host: true,
    },
  };
});
