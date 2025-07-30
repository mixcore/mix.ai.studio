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
	import { previewUrl, userActions, mixcoreConnected, viewMode } from '$lib/stores';
	import { files as mockFiles } from '$lib/vsc-mock/files';

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
		}
	});
</script>

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
