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
			const initialized = await userActions.initialize();
			if (initialized) {
				showWelcome = false;
			} else {
				console.log('Mixcore not initialized - showing welcome screen');
			}
		} catch (error) {
			console.error('Failed to initialize Mixcore:', error);
		}
		
		// Set preview URL from environment variables, with a fallback.
		// Vite exposes environment variables prefixed with VITE_ on the `import.meta.env` object.
		const endpoint = import.meta.env.VITE_MIXCORE_PREVIEW_ENDPOINT;
		previewUrl.set(endpoint || 'https://mixcore.net');

	});
	
	// Reactive logic to show/hide welcome screen
	$: {
		if ($isAuthenticated && $hasProjects) {
			showWelcome = false;
		} else if (!$isAuthenticated) {
			showWelcome = true;
		}
	}
	
	function handleWelcomeLogin() {
		authMode = 'login';
		showAuthModal = true;
	}
	
	function handleWelcomeGetStarted() {
		if ($isAuthenticated) {
			showWelcome = false;
		} else {
			handleWelcomeLogin();
		}
	}
	
	function closeAuthModal() {
		showAuthModal = false;
	}
	
	function handleAuthSuccess() {
		showAuthModal = false;
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
		<Navigation projectName="My Awesome App" />
		
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
