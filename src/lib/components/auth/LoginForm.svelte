<script lang="ts">
	import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	export let loading = false;
	export let error = '';

	let username = '';
	let password = '';
	let showPassword = false;
	let usernameError = '';
	let passwordError = '';

	const dispatch = createEventDispatcher<{
		login: { username: string; password: string };
		register: void;
		forgotPassword: { username: string };
	}>();

	function validateUsername(): boolean {
		usernameError = '';
		if (!username) {
			usernameError = 'Username is required';
			return false;
		} else if (username.length < 3) {
			usernameError = 'Username must be at least 3 characters';
			return false;
		} else if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
			usernameError = 'Username can only contain letters, numbers, underscores, dots, and hyphens';
			return false;
		}
		return true;
	}

	function validateForm(): boolean {
		passwordError = '';
		const isUsernameValid = validateUsername();

		let isPasswordValid = true;
		if (!password) {
			passwordError = 'Password is required';
			isPasswordValid = false;
		} else if (password.length < 6) {
			passwordError = 'Password must be at least 6 characters';
			isPasswordValid = false;
		}

		return isUsernameValid && isPasswordValid;
	}

	function handleSubmit() {
		if (validateForm() && !loading) {
			dispatch('login', { username, password });
		}
	}

	function handleForgotPassword() {
		if (validateUsername()) {
			dispatch('forgotPassword', { username });
		}
	}

	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}
</script>

<div class="w-full max-w-md mx-auto">
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<!-- Header -->
			<div class="text-center mb-6">
				<div class="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
					<div class="w-6 h-6 bg-white rounded-sm"></div>
				</div>
				<h2 class="text-2xl font-bold">Welcome to Mix Portal</h2>
				<p class="text-base-content/70 mt-2">Sign in to your account</p>
			</div>

			<!-- Error Alert -->
			{#if error}
				<div class="alert alert-error mb-4">
					<span class="text-sm">{error}</span>
				</div>
			{/if}

			<!-- Form -->
			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<!-- Username Input -->
				<div class="form-control">
					<label class="label" for="username">
						<span class="label-text font-medium">Username</span>
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<User class="w-5 h-5 text-base-content/40" />
						</div>
<input
	id="username"
	type="text"
	bind:value={username}
	placeholder="Enter your username"
	class="input input-bordered w-full pl-10"
	class:input-error={usernameError}
	disabled={loading}
	autocomplete="username"
	on:input={() => error = ''}
/>
					</div>
					{#if usernameError}
						<label class="label">
							<span class="label-text-alt text-error">{usernameError}</span>
						</label>
					{/if}
				</div>

				<!-- Password Input -->
				<div class="form-control">
					<label class="label" for="password">
						<span class="label-text font-medium">Password</span>
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Lock class="w-5 h-5 text-base-content/40" />
						</div>
<input
	id="password"
	type={showPassword ? 'text' : 'password'}
	bind:value={password}
	placeholder="Enter your password"
	class="input input-bordered w-full pl-10 pr-10"
	class:input-error={passwordError}
	disabled={loading}
	autocomplete="current-password"
	on:input={() => error = ''}
/>
						<button
							type="button"
							class="absolute inset-y-0 right-0 pr-3 flex items-center"
							on:click={togglePasswordVisibility}
							disabled={loading}
						>
							{#if showPassword}
								<EyeOff class="w-5 h-5 text-base-content/40 hover:text-base-content/60" />
							{:else}
								<Eye class="w-5 h-5 text-base-content/40 hover:text-base-content/60" />
							{/if}
						</button>
					</div>
					{#if passwordError}
						<label class="label">
							<span class="label-text-alt text-error">{passwordError}</span>
						</label>
					{/if}
				</div>

				<!-- Forgot Password -->
				<div class="text-right">
					<button
						type="button"
						class="link link-primary text-sm"
						on:click={handleForgotPassword}
						disabled={loading}
					>
						Forgot password?
					</button>
				</div>

				<!-- Login Button -->
				<button
					type="submit"
					class="btn btn-primary w-full"
					disabled={loading}
				>
					{#if loading}
						<Loader2 class="w-4 h-4 animate-spin mr-2" />
						Signing in...
					{:else}
						Sign In
					{/if}
				</button>
			</form>

			<!-- Register Link -->
			<div class="divider">or</div>
			<div class="text-center">
				<span class="text-base-content/70">Don't have an account?</span>
				<button
					class="link link-primary ml-1"
					on:click={() => dispatch('register')}
					disabled={loading}
				>
					Sign up
				</button>
			</div>
		</div>
	</div>
</div>
				