<script lang="ts">
	import Navigation from '$lib/components/navigation/Navigation.svelte';
	import ResizableLayout from '$lib/components/layout/ResizableLayout.svelte';
	import ChatPanel from '$lib/components/chat/ChatPanel.svelte';
	import PreviewPanel from '$lib/components/preview/PreviewPanel.svelte';
	import MixDatabasePanel from '$lib/components/database/MixDatabasePanel.svelte';
	import AgentFlowPanel from '$lib/components/agent/AgentFlowPanel.svelte';
	import VscodePanel from '$lib/components/vscode/VscodePanel.svelte';
	import FloatingChatToggle from '$lib/components/navigation/FloatingChatToggle.svelte';
	import { getContext } from 'svelte';
	import { previewUrl, viewMode } from '$lib/stores';
	import WelcomeScreen from '$lib/components/welcome/WelcomeScreen.svelte';
	import AuthModal from '$lib/components/auth/AuthModal.svelte';
	import { files as mockFiles } from '$lib/vsc-mock/files';

	import type { AuthStore } from '$lib/stores/auth';

	const auth: AuthStore = getContext('auth');

	let showAuthModal = $state(false);
	let authMode = $state<'login' | 'register'>('login');

	$effect(() => {
		const endpoint = import.meta.env.VITE_MIXCORE_PREVIEW_ENDPOINT;
		previewUrl.set(endpoint || 'https://mixcore.net');
	});

	function handleWelcomeLogin() {
		authMode = 'login';
		showAuthModal = true;
	}

	function closeAuthModal() {
		showAuthModal = false;
	}

	function handleAuthSuccess() {
		showAuthModal = false;
	}
</script>

{#if $auth.isAuthenticated}
	<!-- Main Application -->
	<div class="h-screen flex flex-col">
		<!-- Navigation -->
		<Navigation projectName="mixcore.ai" />
		
		<!-- Main Content -->
		<div class="flex-1 overflow-hidden">
			<ResizableLayout>
				<ChatPanel slot="left" />
				<svelte:component 
					this={$viewMode === 'vscode' ? VscodePanel : $viewMode === 'preview' ? PreviewPanel : $viewMode === 'database' ? MixDatabasePanel : AgentFlowPanel} 
					slot="right" 
					files={$viewMode === 'vscode' ? mockFiles : undefined}
				/>
			</ResizableLayout>
		</div>

		<!-- Floating Chat Toggle (appears when chat is hidden) -->
		<FloatingChatToggle />
	</div>
{:else if $auth.loading}
  <div>Loading...</div>
{:else}
	<!-- Welcome Screen -->
	<WelcomeScreen
		on:login={handleWelcomeLogin}
		on:getStarted={handleWelcomeLogin}
	/>
{/if}

<!-- Authentication Modal -->
<AuthModal
	isOpen={showAuthModal}
	mode={authMode}
	on:close={closeAuthModal}
	on:success={handleAuthSuccess}
/>
