import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Allow overriding backend target via env (e.g., BACKEND_URL=http://localhost:8000)
const backendTarget = process.env.BACKEND_URL || 'http://localhost:8000';

export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			// All frontend calls to /api/* will be proxied to FastAPI backend
			'/api': {
				target: backendTarget,
				changeOrigin: true,
				// Remove the /api prefix when forwarding (so /api/predict -> /predict)
				rewrite: path => path.replace(/^\/api/, ''),
				// Helpful for debugging proxy issues
				secure: false,
				configure: (proxy) => {
					proxy.on('error', (err, _req, _res) => {
						console.error('[vite-proxy] error', err.message);
					});
					proxy.on('proxyReq', (proxyReq, req) => {
						console.log(`[vite-proxy] -> ${req.method} ${req.url}`);
					});
				}
			}
		}
	}
});
