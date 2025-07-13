import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ mode }) => {
	// Load environment variables from .env files for the current mode
	const env = loadEnv(mode, process.cwd(), '');

	return {
		plugins: [
			sveltekit(),
			// This plugin will automatically generate and use a self-signed certificate.
			basicSsl()
		],
		server: {
			https: true,
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