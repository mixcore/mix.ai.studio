<script lang="ts">
	import WelcomeScreen from '$lib/components/welcome/WelcomeScreen.svelte';
	import { isAuthenticated } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// Redirect if already authenticated - client side only
	onMount(() => {
		if (typeof window !== 'undefined' && $isAuthenticated) {
			goto('/');
		}
	});

	async function handleWelcomeLogin() {
		await goto('/auth?mode=login');
	}
	
	async function handleWelcomeGetStarted() {
		await goto('/auth?mode=register');
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
	<WelcomeScreen
		on:login={handleWelcomeLogin}
		on:getStarted={handleWelcomeGetStarted}
	/>
</div>
