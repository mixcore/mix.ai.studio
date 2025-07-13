<script lang="ts">
	import { Mail, User, Lock, Eye, EyeOff, Loader2 } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	
	export let loading = false;
	export let error = '';
	
	let usernameOrEmail = '';
	let password = '';
	let showPassword = false;
	let usernameOrEmailError = '';
	let passwordError = '';
	
	const dispatch = createEventDispatcher<{
		login: { usernameOrEmail: string; password: string };
		register: void;
		forgotPassword: { usernameOrEmail: string };
	}>();
	
	function validateEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}
	
	function isEmailFormat(input: string): boolean {
		return input.includes('@');
	}
	
	function validateForm(): boolean {
		usernameOrEmailError = '';
		passwordError = '';
		
		if (!usernameOrEmail) {
			usernameOrEmailError = 'Username or email is required';
			return false;
		}
		
		// If it looks like an email, validate email format
		if (isEmailFormat(usernameOrEmail) && !validateEmail(usernameOrEmail)) {
			usernameOrEmailError = 'Please enter a valid email address';
			return false;
		}
		
		// If it's not an email, validate as username
		if (!isEmailFormat(usernameOrEmail)) {
			if (usernameOrEmail.length < 3) {
				usernameOrEmailError = 'Username must be at least 3 characters';
				return false;
			}
			if (!/^[a-zA-Z0-9_.-]+$/.test(usernameOrEmail)) {
				usernameOrEmailError = 'Username can only contain letters, numbers, underscores, dots, and hyphens';
				return false;
			}
		}
		
		if (!password) {
			passwordError = 'Password is required';
			return false;
		}
		
		if (password.length < 6) {
			passwordError = 'Password must be at least 6 characters';
			return false;
		}
		
		return true;
	}
	
	function handleSubmit() {
		if (validateForm() && !loading) {
			dispatch('login', { usernameOrEmail, password });
		}
	}
	
	function handleForgotPassword() {
		if (usernameOrEmail && validateEmail(usernameOrEmail)) {
			dispatch('forgotPassword', { usernameOrEmail });
		} else {
			usernameOrEmailError = 'Please enter a valid email address';
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
				<!-- Email Input -->
				<div class="form-control">
					<label class="label" for="email">
						<span class="label-text font-medium">Username or Email</span>
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Mail class="w-5 h-5 text-base-content/40" />
						</div>
						<input
							id="email"
							type="email"
                bind:value={usernameOrEmail}
							placeholder="Enter your username or email"
							class="input input-bordered w-full pl-10"
							class:input-error={usernameOrEmailError}
							disabled={loading}
							autocomplete="email"
						/>
					</div>
					{#if usernameOrEmailError}
						<label class="label">
							<span class="label-text-alt text-error">{usernameOrEmailError}</span>
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
