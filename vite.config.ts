import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const apiTarget = (env.VITE_API_DOMAIN || 'https://detidex.yeuthich.net').replace(/\/$/, '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          // Proxy API calls to avoid browser-side CORS during local dev
          '/api': {
            target: apiTarget,
            changeOrigin: true,
            secure: false,
            // keep credentials in dev by forwarding cookie headers
            configure: (proxy) => {
              proxy.on('proxyReq', (proxyReq, req, res) => {
                // ensure cookie header from browser is forwarded
                if (req.headers.cookie) {
                  proxyReq.setHeader('cookie', req.headers.cookie as string);
                }
              });
            },
            rewrite: (p) => p.replace(/^\/api/, '/api'),
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
