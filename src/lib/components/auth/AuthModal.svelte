<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { X } from 'lucide-svelte';
	import LoginForm from './LoginForm.svelte';
	import RegisterForm from './RegisterForm.svelte';
	import { userActions } from '$lib/stores';
	
	export let isOpen = false;
	export let mode: 'login' | 'register' = 'login';
	
	let loading = false;
	let error = '';
	
	const dispatch = createEventDispatcher<{
		close: void;
		success: { user: any };
	}>();
	
	async function handleLogin(event: CustomEvent<{ email: string; password: string }>) {
		const { email, password } = event.detail;
		
		try {
			loading = true;
			error = '';
			
			const success = await userActions.login(email, password);
			
			if (success) {
				dispatch('success', { user: userActions });
				dispatch('close');
			} else {
				error = 'Invalid email or password. Please try again.';
			}
		} catch (err: any) {
			console.error('Login error:', err);
			error = err.message || 'Login failed. Please try again.';
		} finally {
			loading = false;
		}
	}
	
	async function handleRegister(event: CustomEvent<{ username: string; email: string; password: string }>) {
		const { username, email, password } = event.detail;
		
		try {
			loading = true;
			error = '';
			
			// First register the user
			const mixcoreService = await import('$lib/services/mixcore');
			const client = mixcoreService.mixcoreService.getClient();
			
			await client.auth.register({ username, email, password });
			
			// Then automatically log them in
			const success = await userActions.login(email, password);
			
			if (success) {
				dispatch('success', { user: userActions });
				dispatch('close');
			} else {
				error = 'Registration successful, but login failed. Please try logging in manually.';
			}
		} catch (err: any) {
			console.error('Registration error:', err);
			if (err.message.includes('already exists')) {
				error = 'An account with this email already exists. Please try logging in instead.';
			} else {
				error = err.message || 'Registration failed. Please try again.';
			}
		} finally {
			loading = false;
		}
	}
	
	async function handleForgotPassword(event: CustomEvent<{ email: string }>) {
		const { email } = event.detail;
		
		try {
			loading = true;
			error = '';
			
			const mixcoreService = await import('$lib/services/mixcore');
			const client = mixcoreService.mixcoreService.getClient();
			
			const success = await client.auth.resetPassword(email);
			
			if (success) {
				error = ''; // Clear any existing errors
				alert('Password reset email sent! Please check your inbox.');
			} else {
				error = 'Failed to send password reset email. Please try again.';
			}
		} catch (err: any) {
			console.error('Password reset error:', err);
			error = err.message || 'Failed to send password reset email. Please try again.';
		} finally {
			loading = false;
		}
	}
	
	function closeModal() {
		if (!loading) {
			dispatch('close');
		}
	}
	
	function switchMode() {
		if (!loading) {
			mode = mode === 'login' ? 'register' : 'login';
			error = ''; // Clear errors when switching modes
		}
	}
	
	// Close modal on Escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && !loading) {
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
				disabled={loading}
			>
				<X class="w-4 h-4" />
			</button>
			
			<!-- Modal content -->
			<div class="py-4">
				{#if mode === 'login'}
					<LoginForm
						{loading}
						{error}
						on:login={handleLogin}
						on:register={switchMode}
						on:forgotPassword={handleForgotPassword}
					/>
				{:else}
					<RegisterForm
						{loading}
						{error}
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