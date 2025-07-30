<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';
	import { setContext } from 'svelte';
	import { auth } from '$lib/stores/auth';

	onMount(() => {
		auth.initialize();
	});

	setContext('auth', auth);
</script>

<ModeWatcher />
<main class="h-screen">
	<slot />
</main>