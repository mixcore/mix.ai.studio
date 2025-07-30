<script lang="ts">
	import { createEventDispatcher, getContext } from 'svelte';
	import { X } from 'lucide-svelte';
	import LoginForm from './LoginForm.svelte';
	import RegisterForm from './RegisterForm.svelte';

	const auth = getContext('auth');
	
	export let isOpen = false;
	export let mode: 'login' | 'register' = 'login';
	
	const dispatch = createEventDispatcher<{
		close: void;
		success: { user: any };
	}>();
	
	async function handleLogin(event: CustomEvent<{ email: string; password: string }>) {
		const { email, password } = event.detail;
		try {
			await auth.login(email, password);
			// Wait for the store to update before dispatching
			if ($auth.isAuthenticated && $auth.user) {
				dispatch('success', { user: $auth.user });
				dispatch('close');
			}
		} catch (error) {
			console.error('Login error in modal:', error);
		}
	}
	
	async function handleRegister(event: CustomEvent<{ username: string; email: string; password: string }>) {
    const { username, email, password } = event.detail;
    // Registration logic is not part of the auth store, so it remains here.
    // You might consider moving this to a separate user service.
    try {
      const mixcoreService = await import('$lib/services/mixcore');
      const client = mixcoreService.mixcoreService.getClient();
      await client.auth.register({ username, email, password });
      await auth.login(email, password);
      // Wait for the store to update before dispatching
      if ($auth.isAuthenticated && $auth.user) {
        dispatch('success', { user: $auth.user });
        dispatch('close');
      }
    } catch (err) {
      console.error('Registration error:', err);
    }
	}
	
	async function handleForgotPassword(event: CustomEvent<{ email: string }>) {
		const { email } = event.detail;
		// Forgot password logic is not part of the auth store.
	}
	
	function closeModal() {
		if (!$auth.loading) {
			dispatch('close');
		}
	}
	
	function switchMode() {
		if (!$auth.loading) {
			mode = mode === 'login' ? 'register' : 'login';
		}
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && !$auth.loading) {
			closeModal();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<!-- Modal backdrop -->
	<div class="modal modal-open">
		<div class="modal-box relative max-w-lg">
			<!-- Close button -->
			<button
				class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
				on:click={closeModal}
				disabled={$auth.loading}
			>
				<X class="w-4 h-4" />
			</button>
			
			<!-- Modal content -->
			<div class="py-4">
				{#if mode === 'login'}
					<LoginForm
						loading={$auth.loading}
						error={$auth.error?.message}
						on:login={handleLogin}
						on:register={switchMode}
						on:forgotPassword={handleForgotPassword}
					/>
				{:else}
					<RegisterForm
						loading={$auth.loading}
						error={$auth.error?.message}
						on:register={handleRegister}
						on:login={switchMode}
					/>
				{/if}
			</div>
		</div>
		
		<!-- Modal backdrop click to close -->
		<div class="modal-backdrop" on:click={closeModal}></div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.3);
		z-index: -1;
	}
</style>