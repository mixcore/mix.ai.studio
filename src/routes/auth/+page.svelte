<script lang="ts">
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
	import RegisterForm from '$lib/components/auth/RegisterForm.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { isAuthenticated } from '$lib/stores';
	import { onMount } from 'svelte';

	let mode = $page.url.searchParams.get('mode') || 'login';
	let errorMessage = '';

	// Redirect if already authenticated - client side only
	onMount(() => {
		if (typeof window !== 'undefined' && $isAuthenticated) {
			goto('/');
		}
	});

	function closeAuth() {
		goto('/welcome');
	}

	function handleAuthSuccess() {
		goto('/');
	}

	function handleAuthError(event: CustomEvent<{message: string}>) {
		errorMessage = event.detail.message;
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
	<div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
		<div class="p-6">
			{#if mode === 'login'}
				<LoginForm 
					on:close={closeAuth}
					on:success={handleAuthSuccess}
					on:error={handleAuthError}
				/>
			{:else}
				<RegisterForm
					on:close={closeAuth}
					on:success={handleAuthSuccess}
					on:error={handleAuthError}
				/>
			{/if}

			{#if errorMessage}
				<div class="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-md text-sm">
					{errorMessage}
				</div>
			{/if}

			<div class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
				{#if mode === 'login'}
					Don't have an account?{' '}
					<button 
						on:click={() => mode = 'register'}
						class="text-blue-600 dark:text-blue-400 hover:underline"
					>
						Register
					</button>
				{:else}
					Already have an account?{' '}
					<button 
						on:click={() => mode = 'login'}
						class="text-blue-600 dark:text-blue-400 hover:underline"
					>
						Login
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>
