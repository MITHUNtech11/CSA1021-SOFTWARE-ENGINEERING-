import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const { VITE_GATEWAY_ORIGIN: gateway } = loadEnv(mode, process.cwd(), 'VITE_');
  if (gateway || mode === 'hosted') {
    const url = URL.canParse(gateway) ? new URL(gateway) : null;
    if (!url || url.protocol !== 'https:' || url.origin !== gateway) {
      throw new Error('Set VITE_GATEWAY_ORIGIN to the HTTPS gateway origin, without a path or trailing slash.');
    }
  }
  return {
    plugins: [react()],
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': { target: 'http://127.0.0.1:8000', changeOrigin: false },
        '/ws': { target: 'ws://127.0.0.1:8000', ws: true },
      },
    },
  };
});
