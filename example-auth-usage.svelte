<!-- 
Example: How to use the refresh token functionality in your auth components
This file demonstrates integration patterns - you can apply these to your existing auth components
-->

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { 
		userActions, 
		authStatus, 
		refreshInProgress, 
		authError,
		isTokenExpiring,
		tokenExpiry
	} from '$lib/stores';
	import { Loader2, AlertTriangle, RefreshCw, Clock } from 'lucide-svelte';

	// Example of using the new auth stores in your components
	$: ({
		isAuthenticated,
		isRefreshing,
		hasError,
		error,
		isTokenExpiring: tokenExpiring,
		user
	} = $authStatus);

	// Manual refresh token button (for testing or user-initiated refresh)
	async function handleManualRefresh() {
		await userActions.refreshToken();
	}

	// Initialize auth on component mount
	onMount(async () => {
		console.log('🚀 Initializing authentication...');
		await userActions.initialize();
	});

	// Example login handler that uses the enhanced login method
	async function handleLogin(email: string, password: string) {
		console.log('🔐 Attempting login...');
		const result = await userActions.login(email, password);
		
		if (result.success) {
			console.log('✅ Login successful');
		} else {
			console.error('❌ Login failed:', result.error);
		}
	}

	// Format time until token expiry for display
	function formatTimeUntilExpiry(expiry: Date | null): string {
		if (!expiry) return 'Unknown';
		
		const now = new Date();
		const diff = expiry.getTime() - now.getTime();
		
		if (diff <= 0) return 'Expired';
		
		const minutes = Math.floor(diff / (1000 * 60));
		const hours = Math.floor(minutes / 60);
		
		if (hours > 0) {
			return `${hours}h ${minutes % 60}m`;
		}
		return `${minutes}m`;
	}
</script>

<!-- Auth Status Indicator -->
<div class="card bg-base-100 shadow-xl mb-4">
	<div class="card-body p-4">
		<h3 class="card-title text-lg">Authentication Status</h3>
		
		<div class="flex items-center gap-2 mb-2">
			{#if isAuthenticated}
				<div class="badge badge-success">Authenticated</div>
				<span class="text-sm">Welcome, {user?.username || user?.email}</span>
			{:else}
				<div class="badge badge-error">Not Authenticated</div>
			{/if}
		</div>

		{#if isAuthenticated}
			<div class="flex items-center gap-2 text-sm text-base-content/70">
				<Clock class="w-4 h-4" />
				<span>Token expires in: {formatTimeUntilExpiry($tokenExpiry)}</span>
			</div>
		{/if}

		<!-- Token Expiry Warning -->
		{#if tokenExpiring}
			<div class="alert alert-warning mt-2">
				<AlertTriangle class="w-4 h-4" />
				<span class="text-sm">Your session expires soon. It will be refreshed automatically.</span>
			</div>
		{/if}

		<!-- Refresh Progress -->
		{#if $refreshInProgress}
			<div class="alert alert-info mt-2">
				<Loader2 class="w-4 h-4 animate-spin" />
				<span class="text-sm">Refreshing authentication token...</span>
			</div>
		{/if}

		<!-- Auth Error -->
		{#if hasError}
			<div class="alert alert-error mt-2">
				<AlertTriangle class="w-4 h-4" />
				<span class="text-sm">{error}</span>
			</div>
		{/if}

		<!-- Manual Refresh Button -->
		{#if isAuthenticated}
			<div class="card-actions justify-end mt-2">
				<button 
					class="btn btn-outline btn-sm"
					on:click={handleManualRefresh}
					disabled={$refreshInProgress}
				>
					{#if $refreshInProgress}
						<Loader2 class="w-4 h-4 animate-spin" />
					{:else}
						<RefreshCw class="w-4 h-4" />
					{/if}
					Refresh Token
				</button>
			</div>
		{/if}
	</div>
</div>

<!-- Example Integration in LoginForm -->
{#if !isAuthenticated}
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Login Example</h2>
			
			<!-- Your existing LoginForm component would go here -->
			<div class="text-center p-4 border-2 border-dashed border-base-300 rounded-lg">
				<p class="text-base-content/70 mb-4">
					Your LoginForm component should:
				</p>
				<ul class="text-left text-sm space-y-1 text-base-content/80">
					<li>• Use <code>$authStatus</code> for authentication state</li>
					<li>• Show <code>$authError</code> for login errors</li>
					<li>• Call <code>userActions.login()</code> for authentication</li>
					<li>• Display loading state during authentication</li>
				</ul>
				
				<!-- Demo login button -->
				<button 
					class="btn btn-primary mt-4"
					on:click={() => handleLogin('demo@example.com', 'password')}
				>
					Demo Login
				</button>
			</div>
		</div>
	</div>
{:else}
	<!-- User Dashboard -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Welcome to Mix Portal</h2>
			<p>You are successfully authenticated with automatic token refresh!</p>
			
			<div class="card-actions justify-end">
				<button 
					class="btn btn-error"
					on:click={() => userActions.logout()}
				>
					Logout
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	code {
		@apply bg-base-200 px-1 py-0.5 rounded text-xs font-mono;
	}
</style>