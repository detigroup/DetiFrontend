import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const apiTarget = (env.VITE_API_DOMAIN || 'https://detidex.yeuthich.net').replace(/\/$/, '');

    const certDir = path.resolve(__dirname, '.cert');
    const certPath = path.join(certDir, 'dev.detidex.yeuthich.net.pem');
    const keyPath = path.join(certDir, 'dev.detidex.yeuthich.net-key.pem');
    const httpsEnabled = fs.existsSync(certPath) && fs.existsSync(keyPath);
    const httpsOptions = httpsEnabled
      ? { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) }
      : undefined;

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: ['dev.detidex.yeuthich.net'],
        https: httpsOptions,
        hmr: {
          host: 'dev.detidex.yeuthich.net',
          protocol: httpsEnabled ? 'wss' : 'ws',
          clientPort: 3000,
        },
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
