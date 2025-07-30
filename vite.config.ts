import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ mode }) => {
	// Load environment variables from .env files for the current mode
	const env = loadEnv(mode, process.cwd(), '');

	return {
		plugins: [
			sveltekit(),
			// Enable HTTPS with self-signed certificates for development
			basicSsl()
		],
		server: {
			// Enable HTTPS
			https: true,
			// Configure host and port
			host: '0.0.0.0', // Allow external connections
			port: 5173,
			proxy: {
				'/api/v2/rest': {
					// The target for the proxy, configurable via .env (e.g., VITE_PROXY_TARGET=https://localhost:5001)
					target: env.VITE_PROXY_TARGET || 'https://localhost:5001',
					changeOrigin: true,
					secure: false
				}
			}
		}
	};
});