<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount, onDestroy } from 'svelte';
	import { userActions, isAuthenticated, mixcoreService } from '$lib/stores';
	import { get } from 'svelte/store';
	
	// Import auth persistence test in development
	if (import.meta.env.DEV) {
		// import('$lib/test-auth-persistence');
	}

	let visibilityChangeHandler: () => void;

	// Initialize authentication state on page load
	onMount(async () => {
		try {
			await userActions.initialize();
		} catch (error) {
			console.warn('Failed to restore auth state on page load:', error);
		}

		// Handle tab visibility changes to refresh auth state
		visibilityChangeHandler = async () => {
			if (document.visibilityState === 'visible' && get(isAuthenticated)) {
				// Check if auth is still valid when tab becomes visible
				try {
					const client = mixcoreService.getClient();
					if (client.auth.isAuthenticated) {
						// Refresh user data to ensure it's current
						await client.auth.initUserData();
					}
				} catch (error) {
					console.warn('Failed to refresh auth state on tab focus:', error);
				}
			}
		};

		document.addEventListener('visibilitychange', visibilityChangeHandler);
	});

	onDestroy(() => {
		if (visibilityChangeHandler) {
			document.removeEventListener('visibilitychange', visibilityChangeHandler);
		}
	});
</script>

<ModeWatcher />
<main class="h-screen">
	<slot />
</main>