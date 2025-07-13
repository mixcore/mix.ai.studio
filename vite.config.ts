import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
	plugins: [
		sveltekit(),
		// This plugin will automatically generate and use a self-signed certificate.
		// The first time you run `pnpm dev`, you may need to accept the certificate in your browser.
		basicSsl()
	],
	server: {
		// Enable HTTPS for the Vite development server
		https: true,
		proxy: {
			// This will proxy any request from your SvelteKit app starting with /api/v2/rest
			// to your backend server.
			'/api/v2/rest': {
				// IMPORTANT: Replace this with the actual URL of your local backend API
				target: 'https://localhost:5001',
				changeOrigin: true,
				// This allows Vite to proxy requests to a backend that is also using a self-signed certificate.
				secure: false
			}
		}
	}
});