<script lang="ts">
	import Navigation from '$lib/components/navigation/Navigation.svelte';
	import ResizableLayout from '$lib/components/layout/ResizableLayout.svelte';
	import ChatPanel from '$lib/components/chat/ChatPanel.svelte';
	import PreviewPanel from '$lib/components/preview/PreviewPanel.svelte';
	import FloatingChatToggle from '$lib/components/navigation/FloatingChatToggle.svelte';
	import { onMount } from 'svelte';
	import { user, previewUrl, userActions, mixcoreConnected, isAuthenticated, hasProjects } from '$lib/stores';
	import WelcomeScreen from '$lib/components/welcome/WelcomeScreen.svelte';
	import AuthModal from '$lib/components/auth/AuthModal.svelte';

	let showWelcome = true;
	let showAuthModal = false;
	let authMode: 'login' | 'register' = 'login';
	
	onMount(async () => {
		// Initialize Mixcore service
		try {
			await userActions.initialize();
		} catch (error) {
			console.error('Failed to initialize Mixcore:', error);
		}
		
		// Set preview URL from environment variables, with a fallback.
		// Vite exposes environment variables prefixed with VITE_ on the `import.meta.env` object.
		const endpoint = import.meta.env.VITE_MIXCORE_PREVIEW_ENDPOINT;
		previewUrl.set(endpoint || 'https://mixcore.net');

	});
	
	// The welcome screen should only be visible when the user is not authenticated.
	// This reactive statement makes the UI declarative and predictable.
	$: showWelcome = !$isAuthenticated;
	
	function handleWelcomeLogin() {
		authMode = 'login';
		showAuthModal = true;
	}
	
	function handleWelcomeGetStarted() {
		// The WelcomeScreen is only visible when !$isAuthenticated,
		// so we can directly open the login modal.
		handleWelcomeLogin();
	}
	
	function closeAuthModal() {
		showAuthModal = false;
	}
	
	function handleAuthSuccess() {
		// The modal now closes itself on success.
		// This function can be used for other post-login actions, like showing a toast.
		showWelcome = false;
	}
</script>

{#if showWelcome}
	<!-- Welcome Screen -->
	<WelcomeScreen
		on:login={handleWelcomeLogin}
		on:getStarted={handleWelcomeGetStarted}
	/>
{:else}
	<!-- Main Application -->
	<div class="h-screen flex flex-col">
		<!-- Navigation -->
		<Navigation projectName="mixcore.ai" />
		
		<!-- Main Content -->
		<div class="flex-1 overflow-hidden">
			<ResizableLayout>
				<ChatPanel slot="left" />
				<PreviewPanel slot="right" />
			</ResizableLayout>
		</div>

		<!-- Floating Chat Toggle (appears when chat is hidden) -->
		<FloatingChatToggle />
	</div>
{/if}

<!-- Authentication Modal -->
<AuthModal
	isOpen={showAuthModal}
	mode={authMode}
	on:close={closeAuthModal}
	on:success={handleAuthSuccess}
/>
