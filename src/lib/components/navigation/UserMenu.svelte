<script lang="ts">
	import { User, Settings, LogOut, LogIn } from 'lucide-svelte';
	import { user, userActions, isAuthenticated } from '$lib/stores';
	import AuthModal from '$lib/components/auth/AuthModal.svelte';
	
	let showAuthModal = false;
	let authMode: 'login' | 'register' = 'login';
	
	function openLoginModal() {
		authMode = 'login';
		showAuthModal = true;
	}
	
	function openRegisterModal() {
		authMode = 'register';
		showAuthModal = true;
	}
	
	function closeAuthModal() {
		showAuthModal = false;
	}
	
	async function handleLogout() {
		try {
			await userActions.logout();
		} catch (error) {
			console.error('Logout failed:', error);
		}
	}
	
	function handleAuthSuccess() {
		showAuthModal = false;
	}
</script>

{#if $isAuthenticated}
	<!-- Authenticated User Menu -->
	<div class="dropdown dropdown-end">
		<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
			<div class="w-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-medium">
				{$user?.name?.[0]?.toUpperCase() || $user?.email?.[0]?.toUpperCase() || 'U'}
			</div>
		</div>
		<ul tabindex="0" class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-300">
			<li class="menu-title">
				<span class="text-sm font-medium">{$user?.name || 'User'}</span>
				<span class="text-xs opacity-60">{$user?.email || 'user@example.com'}</span>
			</li>
			<div class="divider my-1"></div>
			<li>
				<button class="flex items-center gap-2">
					<User class="w-4 h-4" />
					Profile
				</button>
			</li>
			<li>
				<button class="flex items-center gap-2">
					<Settings class="w-4 h-4" />
					Settings
				</button>
			</li>
			<div class="divider my-1"></div>
			<li>
				<button class="flex items-center gap-2 text-error" on:click={handleLogout}>
					<LogOut class="w-4 h-4" />
					Sign out
				</button>
			</li>
		</ul>
	</div>
{:else}
	<!-- Unauthenticated User Menu -->
	<div class="dropdown dropdown-end">
		<div tabindex="0" role="button" class="btn btn-ghost btn-circle">
			<User class="w-5 h-5" />
		</div>
		<ul tabindex="0" class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-300">
			<li class="menu-title">
				<span class="text-sm font-medium">Account</span>
			</li>
			<li>
				<button class="flex items-center gap-2" on:click={openLoginModal}>
					<LogIn class="w-4 h-4" />
					Sign In
				</button>
			</li>
			<li>
				<button class="flex items-center gap-2" on:click={openRegisterModal}>
					<User class="w-4 h-4" />
					Create Account
				</button>
			</li>
		</ul>
	</div>
{/if}

<!-- Authentication Modal -->
<AuthModal
	isOpen={showAuthModal}
	mode={authMode}
	on:close={closeAuthModal}
	on:success={handleAuthSuccess}
/>