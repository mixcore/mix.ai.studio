import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import fs from 'node:fs';
import path from 'node:path';

export default defineConfig(({ mode }) => {
	// Load environment variables from .env files for the current mode
	const env = loadEnv(mode, process.cwd(), '');

	// Detect local certs under ./certs
	const certDir = path.resolve(process.cwd(), 'certs');
	const candidates = [
		{ cert: path.join(certDir, 'localhost.pem'), key: path.join(certDir, 'localhost-key.pem') },
		{ cert: path.join(certDir, 'cert.pem'), key: path.join(certDir, 'key.pem') }
	];

	let httpsConfig: any = {};
	let useBasicSsl = true;
	for (const c of candidates) {
		if (fs.existsSync(c.cert) && fs.existsSync(c.key)) {
			httpsConfig = {
				cert: fs.readFileSync(c.cert),
				key: fs.readFileSync(c.key)
			};
			useBasicSsl = false;
			console.log('[vite] Using TLS certs from', c.cert);
			break;
		}
	}

	if (useBasicSsl) {
		console.log('[vite] No local certs found in ./certs — falling back to plugin-basic-ssl self-signed cert (browser will warn unless trusted)');
	}

	const plugins: any[] = [sveltekit()];
	if (useBasicSsl) plugins.push(basicSsl());

	return {
		plugins,
		server: {
			// Enable HTTPS (either provided certs or plugin-basic-ssl)
			https: httpsConfig,
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