<script lang="ts">
	import Navigation from '$lib/components/navigation/Navigation.svelte';
	import ResizableLayout from '$lib/components/layout/ResizableLayout.svelte';
	import ChatPanel from '$lib/components/chat/ChatPanel.svelte';
	import PreviewPanel from '$lib/components/preview/PreviewPanel.svelte';
	import MixDatabasePanel from '$lib/components/database/MixDatabasePanel.svelte';
	import AgentFlowPanel from '$lib/components/agent/AgentFlowPanel.svelte';
	import VscodePanel from '$lib/components/vscode/VscodePanel.svelte';
	import FloatingChatToggle from '$lib/components/navigation/FloatingChatToggle.svelte';
	import { onMount } from 'svelte';
	import { user, previewUrl, userActions, mixcoreConnected, isAuthenticated, hasProjects, viewMode } from '$lib/stores';
	import WelcomeScreen from '$lib/components/welcome/WelcomeScreen.svelte';
	import AuthModal from '$lib/components/auth/AuthModal.svelte';
	import { files as mockFiles } from '$lib/vsc-mock/files';

	let showWelcome = true;
	let showAuthModal = false;
	let authMode: 'login' | 'register' = 'login';
	
	onMount(async () => {
		// Set preview URL from environment variables first
		const endpoint = import.meta.env.VITE_MIXCORE_PREVIEW_ENDPOINT;
		previewUrl.set(endpoint || 'https://mixcore.net');

		// Initialize Mixcore service with better error handling
		try {
			const initialized = await userActions.initialize();
			if (!initialized) {
				console.warn('Mixcore service failed to initialize - running in offline mode');
				// Set connection status to disconnected
				mixcoreConnected.set(false);
			}
		} catch (error) {
			console.error('Failed to initialize Mixcore:', error);
			// Ensure we're in a safe state even if initialization fails
			mixcoreConnected.set(false);
			user.set(null);
			
			// Show a toast or notification to the user (optional)
			if (error instanceof Error && error.message.includes('HTTP Error')) {
				console.warn('Mixcore endpoint unavailable - check network connection or endpoint configuration');
			}
		}
	});
	
	// The welcome screen should only be visible when the user is not authenticated.
	// This reactive statement makes the UI declarative and predictable.
	// If Mixcore is not connected, we can still show the app but with limited functionality
	$: showWelcome = !$isAuthenticated && !import.meta.env.VITE_DEMO_MODE;
	
	
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
				{#if $viewMode === 'vscode'}
					<VscodePanel slot="right" files={mockFiles} />
				{:else if $viewMode === 'preview'}
					<PreviewPanel slot="right" />
				{:else if $viewMode === 'database'}
					<MixDatabasePanel slot="right" />
				{:else}
					<AgentFlowPanel slot="right" />
				{/if}
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
