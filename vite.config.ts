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
			https: {},
			// Configure host and port
			host: '0.0.0.0', // Allow external connections
			port: 5173,
			proxy: {
				'/api/v2/rest': {
					// The target for the proxy, configurable via .env (e.g., VITE_PROXY_TARGET=https://localhost:5001)
					target: env.VITE_PROXY_TARGET || 'https://localhost:5001',
					changeOrigin: true,
					secure: false
				},
				// Proxy for external LLM APIs to avoid CORS
				'/proxy/anthropic': {
					target: 'https://api.anthropic.com',
					changeOrigin: true,
					secure: true,
					rewrite: (path) => path.replace(/^\/proxy\/anthropic/, '')
				},
				'/proxy/openai': {
					target: 'https://api.openai.com',
					changeOrigin: true,
					secure: true,
					rewrite: (path) => path.replace(/^\/proxy\/openai/, '')
				},
				'/proxy/gemini': {
					target: 'https://generativelanguage.googleapis.com',
					changeOrigin: true,
					secure: true,
					rewrite: (path) => path.replace(/^\/proxy\/gemini/, '')
				},
				'/proxy/deepseek': {
					target: 'https://api.deepseek.com',
					changeOrigin: true,
					secure: true,
					rewrite: (path) => path.replace(/^\/proxy\/deepseek/, '')
				}
			}
		}
	};
});