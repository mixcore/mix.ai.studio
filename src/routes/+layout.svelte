<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';
	import { setContext } from 'svelte';
	import { auth } from '$lib/stores/auth';

	onMount(async () => {
		try {
			await auth.initialize();
		} catch (error) {
			console.error('Failed to initialize auth:', error);
		}
	});

	setContext('auth', auth);
</script>

<ModeWatcher />
<main class="h-screen">
	<slot />
</main>