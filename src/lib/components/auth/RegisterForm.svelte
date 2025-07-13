<script lang="ts">
	import { User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	
	export let loading = false;
	export let error = '';
	
	let username = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let showPassword = false;
	let showConfirmPassword = false;
	let acceptTerms = false;
	
	let usernameError = '';
	let emailError = '';
	let passwordError = '';
	let confirmPasswordError = '';
	let termsError = '';
	
	const dispatch = createEventDispatcher<{
		register: { username: string; email: string; password: string };
		login: void;
	}>();
	
	function validateEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}
	
	function validateForm(): boolean {
		// Reset errors
		usernameError = '';
		emailError = '';
		passwordError = '';
		confirmPasswordError = '';
		termsError = '';
		
		let isValid = true;
		
		// Username validation
		if (!username) {
			usernameError = 'Username is required';
			isValid = false;
		} else if (username.length < 3) {
			usernameError = 'Username must be at least 3 characters';
			isValid = false;
		} else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
			usernameError = 'Username can only contain letters, numbers, underscores, and hyphens';
			isValid = false;
		}
		
		// Email validation
		if (!email) {
			emailError = 'Email is required';
			isValid = false;
		} else if (!validateEmail(email)) {
			emailError = 'Please enter a valid email address';
			isValid = false;
		}
		
		// Password validation
		if (!password) {
			passwordError = 'Password is required';
			isValid = false;
		} else if (password.length < 6) {
			passwordError = 'Password must be at least 6 characters';
			isValid = false;
		} else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
			passwordError = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
			isValid = false;
		}
		
		// Confirm password validation
		if (!confirmPassword) {
			confirmPasswordError = 'Please confirm your password';
			isValid = false;
		} else if (password !== confirmPassword) {
			confirmPasswordError = 'Passwords do not match';
			isValid = false;
		}
		
		// Terms validation
		if (!acceptTerms) {
			termsError = 'You must accept the terms and conditions';
			isValid = false;
		}
		
		return isValid;
	}
	
	function handleSubmit() {
		if (validateForm() && !loading) {
			dispatch('register', { username, email, password });
		}
	}
	
	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}
	
	function toggleConfirmPasswordVisibility() {
		showConfirmPassword = !showConfirmPassword;
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
				<h2 class="text-2xl font-bold">Create Account</h2>
				<p class="text-base-content/70 mt-2">Join Mix Portal today</p>
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
							placeholder="Choose a username"
							class="input input-bordered w-full pl-10"
							class:input-error={usernameError}
							disabled={loading}
							autocomplete="username"
						/>
					</div>
					{#if usernameError}
						<label class="label">
							<span class="label-text-alt text-error">{usernameError}</span>
						</label>
					{/if}
				</div>
				
				<!-- Email Input -->
				<div class="form-control">
					<label class="label" for="email">
						<span class="label-text font-medium">Email</span>
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Mail class="w-5 h-5 text-base-content/40" />
						</div>
						<input
							id="email"
							type="email"
							bind:value={email}
							placeholder="Enter your email"
							class="input input-bordered w-full pl-10"
							class:input-error={emailError}
							disabled={loading}
							autocomplete="email"
						/>
					</div>
					{#if emailError}
						<label class="label">
							<span class="label-text-alt text-error">{emailError}</span>
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
							placeholder="Create a password"
							class="input input-bordered w-full pl-10 pr-10"
							class:input-error={passwordError}
							disabled={loading}
							autocomplete="new-password"
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
				
				<!-- Confirm Password Input -->
				<div class="form-control">
					<label class="label" for="confirmPassword">
						<span class="label-text font-medium">Confirm Password</span>
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Lock class="w-5 h-5 text-base-content/40" />
						</div>
						<input
							id="confirmPassword"
							type={showConfirmPassword ? 'text' : 'password'}
							bind:value={confirmPassword}
							placeholder="Confirm your password"
							class="input input-bordered w-full pl-10 pr-10"
							class:input-error={confirmPasswordError}
							disabled={loading}
							autocomplete="new-password"
						/>
						<button
							type="button"
							class="absolute inset-y-0 right-0 pr-3 flex items-center"
							on:click={toggleConfirmPasswordVisibility}
							disabled={loading}
						>
							{#if showConfirmPassword}
								<EyeOff class="w-5 h-5 text-base-content/40 hover:text-base-content/60" />
							{:else}
								<Eye class="w-5 h-5 text-base-content/40 hover:text-base-content/60" />
							{/if}
						</button>
					</div>
					{#if confirmPasswordError}
						<label class="label">
							<span class="label-text-alt text-error">{confirmPasswordError}</span>
						</label>
					{/if}
				</div>
				
				<!-- Terms and Conditions -->
				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-3">
						<input
							type="checkbox"
							bind:checked={acceptTerms}
							class="checkbox checkbox-primary"
							class:checkbox-error={termsError}
							disabled={loading}
						/>
						<span class="label-text">
							I agree to the <a href="/terms" class="link link-primary">Terms of Service</a> 
							and <a href="/privacy" class="link link-primary">Privacy Policy</a>
						</span>
					</label>
					{#if termsError}
						<label class="label">
							<span class="label-text-alt text-error">{termsError}</span>
						</label>
					{/if}
				</div>
				
				<!-- Register Button -->
				<button
					type="submit"
					class="btn btn-primary w-full"
					disabled={loading}
				>
					{#if loading}
						<Loader2 class="w-4 h-4 animate-spin mr-2" />
						Creating account...
					{:else}
						Create Account
					{/if}
				</button>
			</form>
			
			<!-- Login Link -->
			<div class="divider">or</div>
			<div class="text-center">
				<span class="text-base-content/70">Already have an account?</span>
				<button
					class="link link-primary ml-1"
					on:click={() => dispatch('login')}
					disabled={loading}
				>
					Sign in
				</button>
			</div>
		</div>
	</div>
</div>