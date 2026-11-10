import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { apiUrlGuard } from './scripts/check-api-url.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Set VITE_BASE_PATH=/sub-path/ when hosting somewhere that is not the domain root. Cloudflare serves
    // the site at the root, so it is unset there.
    base: env.VITE_BASE_PATH || '/',
    // Production builds stop if the API address would not work for visitors (scripts/check-api-url.js).
    plugins: [react(), apiUrlGuard({ mode, apiUrl: env.VITE_API_URL })],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: { port: 5173 },
    preview: { port: 4173 },
    test: { environment: 'jsdom' },
  };
});
